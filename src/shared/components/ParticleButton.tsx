"use client";

import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import { Button } from "@/shared/components/Button";

type ParticleButtonProps = ComponentProps<typeof Button> & {
  onSuccess?: () => void;
};

export function ParticleButton({ children, className = "", onClick, onSuccess, ...props }: ParticleButtonProps) {
  const [burst, setBurst] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setBurst(false);
      requestAnimationFrame(() => setBurst(true));
      timeoutRef.current = setTimeout(() => setBurst(false), 700);
    }
    onSuccess?.();
  }

  return (
    <Button {...props} className={`serena-particle-button ${className}`} onClick={handleClick}>
      <span className="relative z-10">{children}</span>
      {burst ? <span aria-hidden="true" className="serena-particle-burst">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--particle-index": index } as React.CSSProperties} />)}</span> : null}
    </Button>
  );
}
