import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Procedural scrolling spectrogram — purely decorative. */
export function SpectrogramCanvas({ className = "", height = "100%" }: { className?: string; height?: number | string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
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

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--signal") || "36 100% 56%";
    let t = 0;
    let raf = 0;
    let col = 0;

    const tick = () => {
      const w = c.clientWidth, h = c.clientHeight;
      // scroll left by 1px
      const img = ctx.getImageData(1, 0, w - 1, h);
      ctx.putImageData(img, 0, 0);
      ctx.clearRect(w - 1, 0, 1, h);

      // draw a new column
      const rows = 64;
      const cellH = h / rows;
      for (let i = 0; i < rows; i++) {
        const freq = i / rows;
        const v =
          0.45 +
          0.35 * Math.sin(t * 0.6 + freq * 8) +
          0.25 * Math.sin(t * 1.7 + freq * 22 + col * 0.02) +
          (Math.random() - 0.5) * 0.15;
        const a = Math.max(0, Math.min(1, v - 0.35 - freq * 0.2));
        ctx.fillStyle = `hsla(${accent.trim().split(" ").join(", ")}, ${a})`;
        ctx.fillRect(w - 1, h - (i + 1) * cellH, 1, cellH + 0.5);
      }
      t += reduced ? 0.005 : 0.04;
      col++;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [reduced]);

  return <canvas ref={ref} className={className} style={{ width: "100%", height }} aria-hidden />;
}
