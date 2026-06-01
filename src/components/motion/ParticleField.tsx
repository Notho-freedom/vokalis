import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = { className?: string; density?: number };

export function ParticleField({ className = "", density = 80 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const c = ref.current;
    if (!c || reduced) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const accent = `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--signal") || "36 100% 56%"})`;
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const particles: P[] = Array.from({ length: density }, () => ({
      x: Math.random() * c.clientWidth,
      y: Math.random() * c.clientHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.1 - Math.random() * 0.3,
      r: 0.6 + Math.random() * 2.2,
      a: 0.15 + Math.random() * 0.5,
    }));

    let raf = 0;
    let scrollBoost = 0;
    const onScroll = () => { scrollBoost = Math.min(2, scrollBoost + 0.4); };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      scrollBoost *= 0.92;
      particles.forEach((p) => {
        p.x += p.vx * (1 + scrollBoost);
        p.y += p.vy * (1 + scrollBoost);
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.fillStyle = accent;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [density, reduced]);

  return <canvas ref={ref} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden />;
}
