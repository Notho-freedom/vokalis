import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Pause, Code2, Mic, Sparkles, Globe2, Zap, BookOpen, Layers } from "lucide-react";
import heroWaveform from "@/assets/hero-waveform.jpg";
import studioMic from "@/assets/studio-mic.jpg";
import spectrogram from "@/assets/spectrogram.jpg";
import portrait1 from "@/assets/voice-portrait-1.jpg";
import portrait2 from "@/assets/voice-portrait-2.jpg";
import portrait3 from "@/assets/voice-portrait-3.jpg";
import portrait4 from "@/assets/voice-portrait-4.jpg";
import { synthesize } from "@/lib/tts";
import { toast } from "sonner";

const HELLOS = ["bonjour", "hello", "你好", "مرحبا", "olá", "नमस्ते", "こんにちは", "안녕"];

function RotatingHello() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % HELLOS.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-block relative">
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
        exit={{ opacity: 0, y: -24, filter: "blur(12px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="italic text-signal text-glow"
      >
        {HELLOS[i]}
      </motion.span>
    </span>
  );
}

function HeroDemo() {
  const [text] = useState("The future of synthetic voice is open, free, and made for everyone.");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const play = async () => {
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    if (audioRef.current.src) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }
    setBusy(true);
    try {
      const { blob } = await synthesize(text, "en-US-AvaMultilingualNeural");
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.onended = () => setPlaying(false);
      await audioRef.current.play();
      setPlaying(true);
    } catch (e: any) {
      toast.error("Demo failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border hairline bg-card/40 backdrop-blur-md rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="mono-label text-muted-foreground flex items-center gap-2">
          <span className="signal-dot" /> Live demo · en-US-AvaMultilingual
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">{text.length} chars · ~6s</span>
      </div>
      <p className="font-display text-2xl md:text-3xl leading-tight text-foreground/90 mb-6">"{text}"</p>
      <div className="flex items-center gap-4">
        <button
          onClick={play}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal text-accent-foreground rounded-md font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {busy ? <span className="audio-bars"><span/><span/><span/><span/><span/></span> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {busy ? "Synthesizing…" : playing ? "Pause" : "Listen"}
        </button>
        <Link to="/playground" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          Open Playground <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Zap, title: "Streaming under 300ms", desc: "Audio chunks delivered as they're generated. Build live voice agents and assistants without buffering." },
  { icon: Globe2, title: "100+ languages", desc: "Auto-detection picks the right voice from a single line of text. No language config needed." },
  { icon: Layers, title: "Voice Lab", desc: "Compose multi-voice dialogues, podcasts, and audiobooks on a timeline. Export a single MP3." },
  { icon: BookOpen, title: "Article & PDF reader", desc: "Paste a URL or drop a PDF. Get back a navigable audiobook with chapters." },
  { icon: Sparkles, title: "12 curated personas", desc: "Thriller narrator, FM news, calm meditation, cinema trailer. One click, ready to ship." },
  { icon: Code2, title: "Developer-grade SDK", desc: "TypeScript SDK, REST API, webhooks, replay-by-ID debugging. Built like infra." },
];

const VOICES_FEATURED = [
  { name: "Aria", lang: "en-US", desc: "Warm, multilingual, narration", img: portrait1 },
  { name: "Wei", lang: "zh-CN", desc: "Mandarin · authoritative news", img: portrait2 },
  { name: "Sofía", lang: "es-MX", desc: "Soft Spanish · audiobooks", img: portrait3 },
  { name: "Hugo", lang: "fr-FR", desc: "Deep French · documentary", img: portrait4 },
];

export default function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0 z-0">
          <img src={heroWaveform} alt="" className="w-full h-full object-cover opacity-50 dark:opacity-70" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-28 md:pt-40 pb-20 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 mb-8 mono-label text-muted-foreground"
          >
            <span className="signal-dot" /> v2.0 · Cinematic release · 412 voices online
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[15vw] md:text-[12vw] lg:text-[140px] leading-[0.85] tracking-tighter mb-8"
          >
            Say <RotatingHello /><br />
            <span className="text-muted-foreground/70">to your audience.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-prose text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
          >
            A cinematic text-to-speech studio. 400+ neural voices, 100+ languages, streaming under 300&nbsp;ms.
            Built for podcasters, devs, audiobook makers — and free, forever.
          </motion.p>

          <div className="flex flex-wrap gap-3 mb-20">
            <Link
              to="/playground"
              className="inline-flex items-center gap-2 px-6 py-3 bg-signal text-accent-foreground rounded-md font-medium hover:opacity-90 transition glow-signal"
            >
              Open the studio <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 border hairline rounded-md hover:bg-secondary transition text-sm"
            >
              <Code2 className="w-4 h-4" /> Read the docs
            </Link>
          </div>

          <HeroDemo />
        </div>
      </section>

      {/* TICKER */}
      <section className="border-b hairline py-5 bg-card/30 ticker">
        <div className="ticker-track gap-12 mono-label text-muted-foreground whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-12">
              <span>● 412 voices online</span>
              <span>● 100+ languages</span>
              <span>● streaming &lt;300ms</span>
              <span>● 500k chars / month free</span>
              <span>● open API</span>
              <span>● built on edge-tts</span>
              <span>● typescript SDK</span>
              <span>● webhooks & replay</span>
              <span>● 99.97% uptime</span>
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
          <div>
            <div className="section-num mb-4">01 — Capabilities</div>
            <h2 className="font-display text-5xl md:text-7xl tracking-tight max-w-3xl">
              More than <span className="italic text-signal">free TTS</span>.<br/>
              A complete voice platform.
            </h2>
          </div>
          <p className="font-prose text-muted-foreground max-w-sm">
            Everything you need to ship voice — from a one-liner API call to a full multi-voice audiobook studio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-background p-8 hover:bg-card transition group"
            >
              <f.icon className="w-5 h-5 text-signal mb-6 group-hover:scale-110 transition" />
              <h3 className="font-display text-2xl mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PERSONAS PROMO */}
      <section className="border-y hairline bg-card/30 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block opacity-40">
          <img src={spectrogram} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 relative">
          <div className="section-num mb-4">02 — Personas</div>
          <h2 className="font-display text-5xl md:text-7xl tracking-tight max-w-3xl mb-8">
            Twelve voices, <span className="italic">ready to perform</span>.
          </h2>
          <p className="font-prose text-muted-foreground max-w-xl mb-12">
            Curated combinations of voice, rate and pitch. From the calm of meditation to the gravity
            of a cinema trailer — a single click, and you're on air.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {["🌑 Thriller Narrator", "📻 FM News", "🌿 Mindful Guide", "🎬 Cinema Trailer", "🥃 Luxury Ad", "🌹 Romance Reader", "💡 TED Speaker", "🦋 Nature Doc"].map((t) => (
              <span key={t} className="px-3 py-1.5 border hairline rounded-full text-xs font-mono text-muted-foreground hover:border-signal hover:text-foreground transition">{t}</span>
            ))}
          </div>
          <Link to="/personas" className="inline-flex items-center gap-2 text-signal hover:gap-3 transition-all">
            Explore the persona library <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FEATURED VOICES */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="section-num mb-4">03 — Featured voices</div>
        <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-16 max-w-3xl">
          Faces behind the <span className="italic">frequencies</span>.
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {VOICES_FEATURED.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-background group cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden bg-card">
                <img src={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
              </div>
              <div className="p-5">
                <div className="mono-label text-muted-foreground mb-2">{v.lang}</div>
                <h3 className="font-display text-2xl mb-1">{v.name}</h3>
                <p className="text-xs text-muted-foreground">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/voices" className="inline-flex items-center gap-2 text-signal hover:gap-3 transition-all">
            Browse all 412 voices <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* DEV SECTION */}
      <section className="border-y hairline relative overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="p-10 md:p-20 relative z-10">
            <div className="section-num mb-4">04 — For developers</div>
            <h2 className="font-display text-5xl md:text-6xl tracking-tight mb-8">
              Voice as <span className="italic text-signal">infrastructure</span>.
            </h2>
            <p className="font-prose text-muted-foreground mb-8 max-w-md">
              REST API, streaming endpoint, TypeScript SDK, webhooks, per-key CORS, replay-by-ID debugging.
              The features you need when "free TTS" needs to scale.
            </p>
            <div className="bg-card border hairline rounded-lg p-5 font-mono text-[12.5px] mb-6 overflow-x-auto">
              <div className="text-muted-foreground">// 1. Synthesize</div>
              <div><span className="text-signal">await</span> vocalis.tts(<span className="text-cool">"Hello world"</span>)</div>
              <div className="mt-3 text-muted-foreground">// 2. Stream</div>
              <div><span className="text-signal">for await</span> (<span className="text-cool">const</span> chunk <span className="text-signal">of</span> vocalis.stream(text)) {`{...}`}</div>
              <div className="mt-3 text-muted-foreground">// 3. Translate then speak</div>
              <div>vocalis.tts(text, {`{ translateTo: `}<span className="text-cool">"ja"</span>{` }`})</div>
            </div>
            <div className="flex gap-3">
              <Link to="/docs" className="px-5 py-2.5 bg-foreground text-background rounded-md text-sm font-medium hover:bg-signal hover:text-accent-foreground transition">
                Documentation
              </Link>
              <Link to="/dashboard" className="px-5 py-2.5 border hairline rounded-md text-sm hover:bg-secondary transition">
                Get an API key
              </Link>
            </div>
          </div>
          <div className="relative min-h-[400px] lg:min-h-full">
            <img src={studioMic} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* SPECS table */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="section-num mb-4">05 — Specs</div>
        <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-16">The numbers.</h2>
        <div className="grid md:grid-cols-2 gap-px bg-border">
          {[
            ["Voices", "412 neural"],
            ["Languages", "100+"],
            ["Streaming latency", "< 300ms p50"],
            ["Free quota", "500,000 chars / month"],
            ["Max input", "5,000 chars per call"],
            ["Audio format", "MP3 24kHz 48kbps"],
            ["SDKs", "TypeScript, Python, cURL"],
            ["Pricing", "Free, forever"],
          ].map(([k, v]) => (
            <div key={k} className="bg-background p-6 flex items-baseline justify-between gap-6">
              <span className="mono-label text-muted-foreground">{k}</span>
              <span className="font-display text-2xl text-right">{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t hairline py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={heroWaveform} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <h2 className="font-display text-6xl md:text-8xl tracking-tight mb-8">
            Ready to <span className="italic text-signal">make some noise</span>?
          </h2>
          <p className="font-prose text-lg text-muted-foreground mb-10">
            Free for life. No credit card. No "trial". Get a key and ship in five minutes.
          </p>
          <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-signal text-accent-foreground rounded-md font-medium hover:opacity-90 transition glow-signal">
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
