import { useEffect, useRef } from "react";

export default function BackgroundAnimation() {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.5;
    let currentX = targetX;
    let currentY = targetY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    const update = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el.style.setProperty("--mx", `${currentX.toFixed(1)}px`);
      el.style.setProperty("--my", `${currentY.toFixed(1)}px`);
      rafId = requestAnimationFrame(update);
    };

    document.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(update);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="hero-grid pointer-events-none absolute inset-0 w-full h-full z-0 select-none overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        ["--mx" as string]: "50%",
        ["--my" as string]: "50%",
        backgroundImage:
          "linear-gradient(90deg, #9ca3af38 1px, transparent 1px), linear-gradient(#9ca3af38 1px, transparent 1px)",
        backgroundPosition: "bottom",
        backgroundSize: "120px 120px",
        WebkitMaskImage:
          "radial-gradient(circle 350px at var(--mx) var(--my), #000 0%, transparent 65%), linear-gradient(to bottom, transparent 0%, transparent 15%, #00000020 40%, #00000060 70%, #000000cc 100%)",
        maskImage:
          "radial-gradient(circle 350px at var(--mx) var(--my), #000 0%, transparent 65%), linear-gradient(to bottom, transparent 0%, transparent 15%, #00000020 40%, #00000060 70%, #000000cc 100%)",
        WebkitMaskComposite: "source-over",
        maskComposite: "add",
      }}
    />
  );
}
