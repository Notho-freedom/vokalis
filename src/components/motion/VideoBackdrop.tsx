import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  opacity?: number;
};

export function VideoBackdrop({ src, poster, className = "", opacity = 0.55 }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) { v.pause(); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced && poster) {
    return (
      <img src={poster} alt="" className={`absolute inset-0 w-full h-full object-cover ${className}`} style={{ opacity }} aria-hidden />
    );
  }

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
