"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { buttonLinkClasses } from "@/shared/components/Button";

export function ScrollDentalStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !window.IntersectionObserver) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    const updateVideo = () => {
      if (visible && !reducedMotion.matches && !document.hidden) {
        void video.play().catch(() => video.pause());
      } else {
        video.pause();
      }
    };
    const updateProgress = () => {
      frame = 0;
      if (reducedMotion.matches) {
        section.style.setProperty("--story-inset", "0%");
        return;
      }
      const bounds = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height * 0.45)));
      section.style.setProperty("--story-inset", `${((1 - progress) * 8).toFixed(2)}%`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    const onMotionChange = () => { updateVideo(); updateProgress(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateVideo();
    }, { threshold: 0.08 });
    observer.observe(section);
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", updateVideo);
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", updateVideo);
      reducedMotion.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, []);

  return (
    <section aria-labelledby="serena-story-title" className="serena-scroll-story px-4 py-16 sm:px-6 lg:px-8 lg:py-24" ref={sectionRef}>
      <div className="mx-auto max-w-7xl">
        <p className="serena-kicker">El cuidado en detalle</p>
        <div className="mt-4 grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-black leading-tight tracking-[-.04em] text-[var(--serena-ink)] sm:text-5xl" id="serena-story-title">Una experiencia pensada para tu tranquilidad.</h2>
            <p className="mt-5 max-w-lg leading-8 text-[var(--serena-text)]">Explora las especialidades, conoce al profesional y elige un horario disponible con información clara.</p>
            <Link className={`${buttonLinkClasses} mt-7`} href="/especialidades">Explorar especialidades</Link>
          </div>
          <div className="serena-scroll-story-frame">
            <video aria-hidden="true" className="serena-scroll-story-video" loop muted playsInline poster="/images/odontograma-denticion.png" preload="none" ref={videoRef} src="/media/odontograma-fondo-animado.mp4" tabIndex={-1} />
            <Image alt="Arcadas dentales ilustradas" className="serena-scroll-story-art" height={1254} sizes="(max-width: 1024px) 90vw, 48vw" src="/images/odontograma-denticion.png" width={1254} />
            <span aria-hidden="true" className="serena-scroll-story-label">Atención con calma · Clínica Serena</span>
          </div>
        </div>
      </div>
    </section>
  );
}
