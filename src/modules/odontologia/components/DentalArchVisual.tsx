"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Illustration only. The FDI chart below remains the clinical control and
 * the only place where a tooth or surface can be selected.
 */
export function DentalArchVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof window.matchMedia !== "function" || typeof window.IntersectionObserver !== "function") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const updatePlayback = () => {
      if (visible && !reducedMotion.matches && !document.hidden) {
        void video.play().catch(() => {
          // The illustration stays available when autoplay is restricted.
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
      },
      { threshold: 0.15 },
    );

    observer.observe(video);
    reducedMotion.addEventListener("change", updatePlayback);
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, []);

  return (
    <figure className="serena-dental-visual">
      <video
        aria-hidden="true"
        className="serena-dental-ambient"
        loop
        muted
        playsInline
        preload="none"
        ref={videoRef}
        src="/media/odontograma-fondo-animado.mp4"
        tabIndex={-1}
      />
      <Image
        alt="Ilustración de referencia de dos arcadas dentales; no representa hallazgos del paciente."
        className="serena-dental-arch"
        height={1254}
        loading="eager"
        sizes="(max-width: 640px) 75vw, 320px"
        src="/images/odontograma-denticion.png"
        width={1254}
      />
      <figcaption className="serena-dental-caption">
        Referencia visual · selecciona piezas y superficies en el esquema inferior
      </figcaption>
    </figure>
  );
}
