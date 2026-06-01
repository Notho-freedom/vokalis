import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHealth } from "@/lib/tts";
import { LiveWaveform } from "@/components/motion/LiveWaveform";

type Health = {
  status: string;
  version: string;
  uptime_seconds: number;
  cache: { items: number; hits: number; misses: number; hit_rate: number };
  latency: { p50_ms: number; p95_ms: number; p99_ms: number; samples: number };
};

const SERVICES = [
  "TTS API",
  "Streaming endpoint",
  "Multi-voice dialogue",
  "Karaoke captions",
  "Translation",
  "Language detection",
  "Voice library",
  "Authentication",
];

function uptimeStr(sec: number) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Status() {
  const [health, setHealth] = useState<Health | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const h = await fetchHealth();
        if (!alive) return;
        setHealth(h);
        setHistory((prev) => [...prev.slice(-59), h.latency?.p50_ms ?? 0]);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const stats = health ? [
    { label: "Status", value: health.status.toUpperCase() },
    { label: "Version", value: `v${health.version}` },
    { label: "Uptime", value: uptimeStr(health.uptime_seconds) },
    { label: "p50 latency", value: `${health.latency.p50_ms || "—"}ms` },
    { label: "p95 latency", value: `${health.latency.p95_ms || "—"}ms` },
    { label: "Cache hit", value: `${Math.round((health.cache.hit_rate || 0) * 100)}%` },
  ] : [];

  const maxLat = Math.max(1, ...history);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-20 pb-32">
      <div className="section-num mb-3">System status</div>
      <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-2">
        {health?.status === "ok" ? "All systems normal." : "Connecting…"}
      </h1>
      <p className="font-prose text-muted-foreground mb-12">Live data, polled every 5 seconds.</p>

      {history.length > 2 && (
        <div className="mb-12 border hairline rounded-lg p-6 bg-card/40">
          <div className="mono-label text-muted-foreground mb-3 flex items-center justify-between">
            <span>p50 latency · last 5 minutes</span>
            <span className="text-signal">{history[history.length - 1]?.toFixed(0)}ms</span>
          </div>
          <svg viewBox={`0 0 ${history.length} 60`} preserveAspectRatio="none" className="w-full h-20">
            <polyline
              fill="none"
              stroke="hsl(var(--signal))"
              strokeWidth="1"
              points={history.map((v, i) => `${i},${60 - (v / maxLat) * 55}`).join(" ")}
            />
          </svg>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border mb-16">
        {(stats.length ? stats : Array.from({ length: 6 }).map(() => ({ label: "Loading…", value: "—" }))).map((s, i) => (
          <div key={i} className="bg-background p-5">
            <div className="mono-label text-muted-foreground mb-2">{s.label}</div>
            <div className="font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-16 border hairline rounded-lg p-6 bg-card/30">
        <div className="mono-label text-muted-foreground mb-3">Live signal</div>
        <LiveWaveform height={64} idle />
      </div>

      <h2 className="font-display text-3xl mb-6">Services</h2>
      <div className="space-y-1">
        {SERVICES.map((name) => (
          <div key={name} className="flex items-center justify-between py-3 border-b hairline">
            <span className="text-sm">{name}</span>
            <span className="inline-flex items-center gap-2 text-xs text-signal">
              <span className="signal-dot" /> Operational
            </span>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to docs
        </Link>
      </div>
    </div>
  );
}
