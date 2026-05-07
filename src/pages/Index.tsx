import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Loader2, Play } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { synthesize } from "@/lib/tts";
import { APP_NAME } from "@/lib/constants";

const GREETINGS = [
  { word: "bonjour", lang: "fr-FR", voice: "fr-FR-DeniseNeural" },
  { word: "hello", lang: "en-US", voice: "en-US-AriaNeural" },
  { word: "hola", lang: "es-ES", voice: "es-ES-ElviraNeural" },
  { word: "你好", lang: "zh-CN", voice: "zh-CN-XiaoxiaoNeural" },
  { word: "مرحبا", lang: "ar-SA", voice: "ar-SA-ZariyahNeural" },
  { word: "こんにちは", lang: "ja-JP", voice: "ja-JP-NanamiNeural" },
  { word: "olá", lang: "pt-BR", voice: "pt-BR-FranciscaNeural" },
];

const SAMPLE = `curl -X POST https://api.vocalis.dev/v1/tts/stream \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello world", "voice": "en-US-AriaNeural"}' \\
  --output speech.mp3`;

const SPECS = [
  ["voices", "412+"],
  ["languages", "104"],
  ["latency p50", "~620ms"],
  ["max chars / req", "5000"],
  ["streaming", "yes / mp3"],
  ["price", "0.00 €"],
];

export default function Index() {
  const [idx, setIdx] = useState(0);
  const [demoText, setDemoText] = useState("Synthetic voice. Crafted for makers.");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % GREETINGS.length), 2400);
    return () => clearInterval(id);
  }, []);

  const playGreeting = async (g: typeof GREETINGS[0]) => {
    try {
      const { blob } = await synthesize(g.word, g.voice);
      new Audio(URL.createObjectURL(blob)).play();
    } catch {}
  };

  const runDemo = async () => {
    setLoading(true);
    try {
      const { blob } = await synthesize(demoText, "en-US-AriaNeural");
      const u = URL.createObjectURL(blob);
      setAudioUrl(u);
      setTimeout(() => audioRef.current?.play(), 100);
    } finally { setLoading(false); }
  };

  const current = GREETINGS[idx];

  return (
    <>
      {/* HERO */}
      <section className="border-b hairline">
        <div className="container py-16 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="mono-label text-muted-foreground mb-6 flex items-center gap-3">
                <span>01 — overview</span>
                <span className="h-px flex-1 max-w-[120px] bg-border" />
                <span>{new Date().toISOString().slice(0, 10)}</span>
              </div>
              <h1 className="font-serif text-[14vw] md:text-[10rem] lg:text-[12rem] leading-[0.88] tracking-[-0.04em]">
                <button
                  onClick={() => playGreeting(current)}
                  key={current.word}
                  className="inline-block animate-fade-in italic font-light hover:text-signal transition-colors"
                  title={`play in ${current.lang}`}
                >
                  {current.word}
                </button>
                <span className="text-muted-foreground">,</span>
                <br />
                <span className="not-italic font-normal">world.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground max-w-[36ch]">
                {APP_NAME} is a free, open-source text-to-speech engine. It transforms any string of text into a human-grade audio stream — through a single REST endpoint, in over a hundred languages, without quotas worth caring about.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/playground"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition"
                >
                  open playground <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/docs"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono border hairline hover:border-signal transition"
                >
                  read docs
                </Link>
              </div>
              <div className="ticker mt-4">
                <div className="ticker-track text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground gap-8 whitespace-nowrap">
                  {[...GREETINGS, ...GREETINGS].map((g, i) => (
                    <span key={i} className="px-3">{g.lang} · {g.word}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INLINE DEMO */}
      <section className="border-b hairline">
        <div className="container py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <div className="mono-label text-muted-foreground mb-3">02 — try it</div>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                Type. Press. <span className="italic font-light">Listen.</span>
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-4 max-w-[34ch]">
                No account. No key. Just a sentence and a voice. The result streams back in under a second.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="border hairline bg-surface">
                <div className="border-b hairline px-4 py-2 flex items-center justify-between mono-label text-muted-foreground">
                  <span>// demo · en-US · aria</span>
                  <span>{demoText.length}/5000</span>
                </div>
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value.slice(0, 5000))}
                  className="w-full bg-transparent p-6 min-h-[160px] resize-none font-serif text-2xl md:text-3xl leading-relaxed focus:outline-none"
                />
                <div className="border-t hairline px-4 py-3 flex items-center justify-between gap-3">
                  <button
                    onClick={runDemo}
                    disabled={loading || !demoText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    {loading ? "synthesizing…" : "synthesize"}
                  </button>
                  {audioUrl && (
                    <audio ref={audioRef} src={audioUrl} controls className="h-8 flex-1 max-w-md" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="border-b hairline">
        <div className="container py-16 md:py-20">
          <div className="mono-label text-muted-foreground mb-8">03 — specs</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y hairline border hairline">
            {SPECS.map(([k, v]) => (
              <div key={k} className="p-6">
                <div className="mono-label text-muted-foreground">{k}</div>
                <div className="font-serif text-3xl md:text-4xl mt-2 tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE */}
      <section className="border-b hairline">
        <div className="container py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <div className="mono-label text-muted-foreground mb-3">04 — interface</div>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                One <span className="italic">endpoint.</span> One header.
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-4 max-w-[34ch]">
                Stream MP3 directly from FastAPI to your client. No SDK needed. cURL away.
              </p>
            </div>
            <div className="md:col-span-8">
              <CodeBlock code={SAMPLE} language="bash" />
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="border-b hairline">
        <div className="container py-16 md:py-20">
          <div className="mono-label text-muted-foreground mb-8">05 — surfaces</div>
          <div className="grid md:grid-cols-2 gap-px bg-border border hairline">
            {[
              { t: "Voice agents", d: "Outbound calls, IVR menus, real-time TTS for agentic loops." },
              { t: "Audiobook pipelines", d: "Long-form synthesis with persona modulation and chapter splits." },
              { t: "Accessibility layers", d: "Read-aloud for any web page, multilingual screen readers." },
              { t: "Content factories", d: "Auto-narrate posts, scripts, video voice-overs at scale." },
            ].map((u) => (
              <div key={u.t} className="bg-background p-8 md:p-10 hover:bg-surface transition">
                <h3 className="font-serif text-3xl md:text-4xl">{u.t}</h3>
                <p className="font-prose text-muted-foreground mt-3 max-w-[44ch]">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container py-20 md:py-28">
          <div className="mono-label text-muted-foreground mb-8">06 — start</div>
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-5xl">
            Ship voice in <span className="italic">five</span> minutes. <span className="text-muted-foreground">Without paying.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-mono bg-signal text-accent-foreground hover:bg-foreground hover:text-background transition"
            >
              get a key <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link to="/playground" className="px-5 py-3 text-sm font-mono border hairline hover:border-signal transition">
              try without account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
