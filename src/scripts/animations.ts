import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export interface AnimationOptions {
  reducedMotion?: boolean;
}

export function initPortfolioAnimations() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lenis: Lenis | null = null;

  if (!prefersReduced) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = (anchor as HTMLAnchorElement).getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (target && lenis) {
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement, {
            offset: 0,
            duration: 1.3,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      });
    });
  }

  if (!prefersReduced && !window.matchMedia("(pointer: coarse)").matches) {
    const magneticElements = document.querySelectorAll<HTMLElement>(".magnetic-btn");

    magneticElements.forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

      el.addEventListener("mousemove", (e) => {
        const bounds = el.getBoundingClientRect();
        const relX = e.clientX - (bounds.left + bounds.width / 2);
        const relY = e.clientY - (bounds.top + bounds.height / 2);

        xTo(relX * 0.28);
        yTo(relY * 0.28);
      });

      el.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  const preloader = document.getElementById("site-preloader");
  const preloaderNumber = document.getElementById("preloader-count");
  const preloaderProgress = document.getElementById("preloader-bar");

  const runHeroEntrance = () => {
    window.dispatchEvent(new CustomEvent("hero-entrance-start"));
    const heroTl = gsap.timeline({
      defaults: { ease: "power4.out" },
    });

    heroTl.fromTo(
      ".hero-line-inner",
      { yPercent: 120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "power4.out" },
      0.1
    );

    heroTl.fromTo(
      ".hero-fade-item",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" },
      0.35
    );

    heroTl.fromTo(
      "#main-nav",
      { y: 50, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power4.out" },
      0.5
    );
  };

  if (preloader && !prefersReduced) {
    gsap.set(".hero-line-inner", { yPercent: 120, opacity: 0 });
    const counter = { val: 0 };
    const preloaderTl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          onComplete: () => {
            preloader.style.display = "none";
            runHeroEntrance();
            ScrollTrigger.refresh();
          },
        });
      },
    });

    preloaderTl.to(counter, {
      val: 100,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        const floorVal = Math.floor(counter.val);
        if (preloaderNumber) {
          preloaderNumber.textContent = `${floorVal < 10 ? "0" + floorVal : floorVal}%`;
        }
        if (preloaderProgress) {
          preloaderProgress.style.width = `${counter.val}%`;
        }
      },
    });
  } else {
    if (preloader) preloader.style.display = "none";
    runHeroEntrance();
  }

  if (!prefersReduced) {
    const sectionHeaders = document.querySelectorAll(".scroll-heading");
    sectionHeaders.forEach((header) => {
      gsap.fromTo(
        header,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: header,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    const aboutText = document.querySelector(".about-text-content");
    if (aboutText) {
      gsap.fromTo(
        aboutText.children,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutText,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const skillsList = document.querySelector(".skills-content-group");
    if (skillsList) {
      gsap.fromTo(
        skillsList,
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: skillsList,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const projectCards = document.querySelectorAll(".project-card-item");
    if (projectCards.length) {
      gsap.fromTo(
        projectCards,
        { y: 50, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.95,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: projectCards[0],
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const contactBlock = document.querySelector(".contact-grid-group");
    if (contactBlock) {
      gsap.fromTo(
        contactBlock.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contactBlock,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
}

