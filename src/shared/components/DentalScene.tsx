"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type DentalSceneProps = {
  compact?: boolean;
  caption?: string;
};

/** Decorative dental scene; clinical tooth selection stays in the odontogram. */
export function DentalScene({ compact = false, caption }: DentalSceneProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !window.IntersectionObserver) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (visible && !reducedMotion.matches && !document.hidden) {
        void video.play().catch(() => video.pause());
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });
    observer.observe(video);
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reducedMotion.removeEventListener("change", update);
      video.pause();
    };
  }, []);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--dental-rotate-x", `${(-y * 8).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--dental-rotate-y", `${(x * 8).toFixed(2)}deg`);
  }

  function resetPointer() {
    sceneRef.current?.style.setProperty("--dental-rotate-x", "0deg");
    sceneRef.current?.style.setProperty("--dental-rotate-y", "0deg");
  }

  return (
    <figure
      className={`serena-dental-scene ${compact ? "serena-dental-scene-compact" : ""}`}
      onPointerLeave={resetPointer}
      onPointerMove={handlePointerMove}
      ref={sceneRef}
    >
      <video aria-hidden="true" className="serena-dental-scene-video" loop muted playsInline preload="none" ref={videoRef} src="/media/odontograma-fondo-animado.mp4" tabIndex={-1} />
      <div aria-hidden="true" className="serena-dental-scene-orbit" />
      <Image
        alt="Ilustración tridimensional de las arcadas dentales de Clínica Serena"
        className="serena-dental-scene-image"
        height={1254}
        loading="eager"
        sizes={compact ? "(max-width: 640px) 160px, (max-width: 1024px) 320px, 400px" : "(max-width: 640px) 90vw, 540px"}
        src="/images/odontograma-denticion.png"
        width={1254}
      />
      {caption ? <figcaption className="serena-dental-scene-caption">{caption}</figcaption> : null}
    </figure>
  );
}
