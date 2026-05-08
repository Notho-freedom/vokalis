import { Link } from "react-router-dom";

const STATS = [
  { label: "Uptime (30d)", value: "99.97%" },
  { label: "p50 latency", value: "186ms" },
  { label: "p95 latency", value: "612ms" },
  { label: "p99 latency", value: "1.4s" },
  { label: "Voices online", value: "412 / 412" },
  { label: "Last incident", value: "73 days ago" },
];

const SERVICES = [
  { name: "TTS API", status: "operational" },
  { name: "Streaming endpoint", status: "operational" },
  { name: "Translation", status: "operational" },
  { name: "Language detection", status: "operational" },
  { name: "Voice library", status: "operational" },
  { name: "Authentication", status: "operational" },
];

export default function Status() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-20 pb-32">
      <div className="section-num mb-3">System status</div>
      <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-2">All systems normal.</h1>
      <p className="font-prose text-muted-foreground mb-12">Updated every 60 seconds. Live metrics from production.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border mb-16">
        {STATS.map((s) => (
          <div key={s.label} className="bg-background p-5">
            <div className="mono-label text-muted-foreground mb-2">{s.label}</div>
            <div className="font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-3xl mb-6">Services</h2>
      <div className="space-y-1">
        {SERVICES.map((s) => (
          <div key={s.name} className="flex items-center justify-between py-3 border-b hairline">
            <span className="text-sm">{s.name}</span>
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
