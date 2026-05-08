import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PERSONAS, PERSONA_CATEGORIES, type Persona } from "@/data/personas";
import { synthesize } from "@/lib/tts";
import { toast } from "sonner";

export default function Personas() {
  const [cat, setCat] = useState("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const filtered = cat === "all" ? PERSONAS : PERSONAS.filter((p) => p.category === cat);

  const play = async (p: Persona) => {
    if (playing === p.id) {
      audioRef.current.pause();
      setPlaying(null);
      return;
    }
    audioRef.current.pause();
    setBusy(p.id);
    try {
      const { blob } = await synthesize(p.sample, p.voice);
      audioRef.current.src = URL.createObjectURL(blob);
      audioRef.current.onended = () => setPlaying(null);
      await audioRef.current.play();
      setPlaying(p.id);
    } catch (e: any) {
      toast.error("Preview failed", { description: e.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-24">
      <div className="section-num mb-4">01 — Personas</div>
      <h1 className="font-display text-6xl md:text-8xl tracking-tight mb-6">
        Voice <span className="italic text-signal">archetypes</span>.
      </h1>
      <p className="font-prose text-lg text-muted-foreground max-w-2xl mb-12">
        Twelve curated combinations of voice, rate and pitch. Pick a mood, click Listen, then ship to the Playground or call the API with the same preset.
      </p>

      <div className="flex flex-wrap gap-2 mb-12">
        {PERSONA_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-4 py-2 text-xs font-mono rounded-full border transition ${
              cat === c.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="bg-background group"
          >
            <div className="aspect-[5/3] overflow-hidden bg-card relative">
              <img src={p.portrait} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute top-4 left-4 text-2xl">{p.emoji}</div>
              <button
                onClick={() => play(p)}
                className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-signal text-accent-foreground flex items-center justify-center hover:scale-110 transition shadow-xl"
              >
                {busy === p.id ? <span className="audio-bars"><span/><span/><span/><span/><span/></span> : playing === p.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl mb-1">{p.name}</h3>
              <p className="text-xs text-signal mb-3 italic">{p.tagline}</p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.description}</p>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t hairline pt-3">
                <span>{p.voice}</span>
                <span>rate {p.rate > 0 ? "+" : ""}{p.rate} · pitch {p.pitch > 0 ? "+" : ""}{p.pitch}</span>
              </div>
              <Link to={`/playground?persona=${p.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground hover:text-signal transition">
                Use in Playground <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
