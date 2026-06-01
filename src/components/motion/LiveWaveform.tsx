import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  audio?: HTMLAudioElement | null;
  height?: number;
  className?: string;
  color?: string;
  /** Idle wave intensity when no audio is playing */
  idle?: boolean;
};

/**
 * Canvas waveform that hooks into an HTMLAudioElement via Web Audio AnalyserNode.
 * Falls back to a procedural sinusoid when no audio is provided or while idle.
 */
export function LiveWaveform({ audio, height = 80, className = "", color, idle = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const stateRef = useRef<{ ctx?: AudioContext; analyser?: AnalyserNode; source?: MediaElementAudioSourceNode; raf?: number }>({});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx2d.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Wire analyser if audio provided
    if (audio) {
      try {
        // @ts-ignore older webkit
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!stateRef.current.ctx) stateRef.current.ctx = new AC();
        if (!stateRef.current.source) {
          stateRef.current.source = stateRef.current.ctx!.createMediaElementSource(audio);
          stateRef.current.analyser = stateRef.current.ctx!.createAnalyser();
          stateRef.current.analyser.fftSize = 1024;
          stateRef.current.source.connect(stateRef.current.analyser);
          stateRef.current.analyser.connect(stateRef.current.ctx!.destination);
        }
      } catch {
        // already connected (audio element reused)
      }
    }

    const bufferLen = stateRef.current.analyser?.frequencyBinCount ?? 256;
    const data = new Uint8Array(bufferLen);

    const accent = color || `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--signal") || "36 100% 56%"})`;

    let t = 0;
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx2d.clearRect(0, 0, w, h);

      // background subtle gradient line
      ctx2d.strokeStyle = "rgba(255,255,255,0.04)";
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(0, h / 2);
      ctx2d.lineTo(w, h / 2);
      ctx2d.stroke();

      let bars: number[] = [];
      const an = stateRef.current.analyser;
      const playing = audio && !audio.paused && !audio.ended;
      if (an && playing) {
        an.getByteFrequencyData(data);
        const step = Math.floor(bufferLen / 64);
        for (let i = 0; i < 64; i++) bars.push(data[i * step] / 255);
      } else if (idle && !reduced) {
        // procedural idle wave
        t += 0.04;
        for (let i = 0; i < 64; i++) {
          const v = 0.18 + 0.08 * Math.sin(i * 0.35 + t) + 0.05 * Math.sin(i * 0.7 - t * 1.3);
          bars.push(v);
        }
      } else {
        for (let i = 0; i < 64; i++) bars.push(0.12);
      }

      const barW = w / bars.length;
      ctx2d.fillStyle = accent;
      bars.forEach((v, i) => {
        const bh = Math.max(2, v * h * 0.9);
        const x = i * barW;
        const y = (h - bh) / 2;
        ctx2d.globalAlpha = 0.65 + v * 0.35;
        ctx2d.fillRect(x + barW * 0.2, y, barW * 0.6, bh);
      });
      ctx2d.globalAlpha = 1;

      stateRef.current.raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      ro.disconnect();
      if (stateRef.current.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, [audio, color, idle, reduced]);

  return <canvas ref={ref} className={className} style={{ width: "100%", height }} />;
}
