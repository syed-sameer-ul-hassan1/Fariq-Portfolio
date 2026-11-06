import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

function setCookie(name: string, val: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function getBrowserFingerprint(): string {
  if (typeof window === "undefined") return "ssr";

  const cached = getCookie("browser_fingerprint") ?? localStorage.getItem("browser_fingerprint");
  if (cached) return cached;

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let canvasData = "";
    if (ctx) {
      canvas.width = 160;
      canvas.height = 30;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(10, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("phool-fingerprint", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("phool-fingerprint", 4, 17);
      canvasData = canvas.toDataURL();
    }

    const payload = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height + "x" + screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 2,
      canvasData,
    ].join("|||");

    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }

    const fingerprint = "bfp_" + Math.abs(hash).toString(36);
    setCookie("browser_fingerprint", fingerprint);
    localStorage.setItem("browser_fingerprint", fingerprint);
    return fingerprint;
  } catch {
    const fallback = "bfp_" + Math.random().toString(36).substring(2, 10);
    setCookie("browser_fingerprint", fallback);
    localStorage.setItem("browser_fingerprint", fallback);
    return fallback;
  }
}

const LikeButton = () => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    setIsClient(true);
    const fp = getBrowserFingerprint();
    setFingerprint(fp);

    const storageKey = `liked_${fp}`;
    const stored = getCookie(storageKey) ?? getCookie("websiteIsLiked") ?? localStorage.getItem(storageKey) ?? localStorage.getItem("websiteIsLiked");
    if (stored) {
      setIsLiked(stored === "true");
    }

    const likeDocRef = doc(db, "likes", "counter");
    const unsubscribe = onSnapshot(
      likeDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const currentLikes = docSnap.data().likes;
          setLikes(Math.max(0, Number(currentLikes) || 0));
        } else {
          setDoc(likeDocRef, { likes: 0 }, { merge: true }).catch(() => {});
        }
      },
      (error) => {
        console.error("Firestore error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleLike = async () => {
    if (isProcessing) return;

    const willLike = !isLiked;
    const previousLikes = likes;

    if (!willLike && previousLikes <= 0) {
      setIsLiked(false);
      const storageKey = `liked_${fingerprint || "default"}`;
      setCookie(storageKey, "false");
      setCookie("websiteIsLiked", "false");
      localStorage.setItem(storageKey, "false");
      localStorage.setItem("websiteIsLiked", "false");
      return;
    }

    setIsLiked(willLike);
    setLikes((prev) => Math.max(0, willLike ? prev + 1 : prev - 1));
    if (willLike) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }

    const storageKey = `liked_${fingerprint || "default"}`;
    setCookie(storageKey, willLike ? "true" : "false");
    setCookie("websiteIsLiked", willLike ? "true" : "false");
    localStorage.setItem(storageKey, willLike ? "true" : "false");
    localStorage.setItem("websiteIsLiked", willLike ? "true" : "false");

    try {
      setIsProcessing(true);
      const likeDocRef = doc(db, "likes", "counter");
      try {
        await updateDoc(likeDocRef, {
          likes: increment(willLike ? 1 : -1),
        });
      } catch (err: any) {
        if (err?.code === "not-found") {
          await setDoc(likeDocRef, { likes: willLike ? 1 : 0 }, { merge: true });
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      setLikes(previousLikes);
      setIsLiked(!willLike);
      setCookie(storageKey, !willLike ? "true" : "false");
      setCookie("websiteIsLiked", !willLike ? "true" : "false");
      localStorage.setItem(storageKey, !willLike ? "true" : "false");
      localStorage.setItem("websiteIsLiked", !willLike ? "true" : "false");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex items-center">
      <button
        onClick={handleToggleLike}
        disabled={isProcessing}
        type="button"
        aria-label={isLiked ? "Unlike website" : "Like website"}
        title={isLiked ? "Liked! Click to undo" : "Click to like"}
        className={`
          group relative w-40 h-10 flex items-center justify-center p-3
          rounded-full transition-all duration-300 ease-in-out transform border-2 cursor-pointer
          hover:scale-105 active:scale-95
          ${isLiked ? "border-[var(--sec)] bg-[var(--sec)]/15 text-white shadow-[0_0_15px_rgba(108,131,156,0.3)]" : "border-[var(--white-icon)] hover:border-[var(--white)] text-[var(--white-icon)]"}
          ${isAnimating ? "animate-heart-pulse" : ""}
          ${isProcessing ? "opacity-75 cursor-wait" : ""}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-6 h-6 transition-all duration-300 ease-in-out pointer-events-none 
            ${isLiked ? "text-[var(--sec)] scale-110 drop-shadow-[0_0_6px_rgba(108,131,156,0.6)]" : "text-[var(--white-icon)] group-hover:scale-105"}
          `}
        >
          <path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path>
        </svg>
        <span className="text-sm pl-3 font-medium select-none">
          {likes} {likes === 1 ? "Like" : "Likes"}
        </span>
      </button>
    </div>
  );
};

export default LikeButton;
