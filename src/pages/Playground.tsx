import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play, Pause, Download, Search, Languages, Wand2, ArrowUpRight, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { fetchVoices, synthesize, langName, countryFlag, type Voice } from "@/lib/tts";
import { translateText } from "@/lib/tts";
import { cn } from "@/lib/utils";

const SAMPLES = [
  "The quiet of the studio is broken only by the hum of the machines.",
  "Bonjour, bienvenue dans le studio. Tout est prêt pour l'enregistrement.",
  "L'intelligence artificielle apprend, mais c'est l'humain qui choisit la voix.",
];

const TARGETS = [
  ["fr", "français"], ["en", "english"], ["es", "español"], ["de", "deutsch"],
  ["it", "italiano"], ["pt", "português"], ["ja", "日本語"], ["zh-CN", "中文"],
  ["ar", "العربية"], ["ru", "русский"],
] as const;

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-6">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-center", active ? "bg-signal" : "bg-border")}
          style={{
            height: "100%",
            animation: active ? `wave 1s ease-in-out ${i * 0.05}s infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function Playground() {
  const [text, setText] = useState(SAMPLES[0]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "Male" | "Female">("all");
  const [lang, setLang] = useState("fr");
  const [selected, setSelected] = useState("fr-FR-DeniseNeural");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [usedVoice, setUsedVoice] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [translateTarget, setTranslateTarget] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: voices = [], isLoading: voicesLoading } = useQuery({
    queryKey: ["voices"], queryFn: fetchVoices, staleTime: 60 * 60 * 1000,
  });

  const languages = useMemo(
    () => Array.from(new Set(voices.map((v) => v.Locale.split("-")[0]))).sort(),
    [voices]
  );

  const filtered = useMemo(() => voices.filter((v) => {
    if (lang && !v.Locale.toLowerCase().startsWith(lang)) return false;
    if (genderFilter !== "all" && v.Gender !== genderFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!v.ShortName.toLowerCase().includes(s) && !langName(v.Locale).toLowerCase().includes(s)) return false;
    }
    return true;
  }), [voices, lang, genderFilter, search]);

  const handleGenerate = async () => {
    if (!text.trim()) return toast.error("Type something first");
    setLoading(true); setAudioUrl(null); setUsedVoice(null); setLatency(null);
    const t0 = performance.now();
    try {
      const { blob, usedVoice } = await synthesize(text, selected);
      const ms = Math.round(performance.now() - t0);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url); setUsedVoice(usedVoice); setLatency(ms);
      setTimeout(() => audioRef.current?.play(), 80);
    } catch (e: any) {
      toast.error(e.message || "Synthesis failed");
    } finally { setLoading(false); }
  };

  const handleTranslate = async () => {
    if (!translateTarget || !text.trim()) return;
    setTranslating(true);
    try {
      const r = await translateText(text, translateTarget);
      setText(r.translated);
      const code = translateTarget.split("-")[0];
      setLang(code);
      const match = voices.find((v) => v.Locale.toLowerCase().startsWith(code));
      if (match) setSelected(match.ShortName);
      toast.success(`Translated to ${langName(translateTarget)}`);
    } catch (e: any) {
      toast.error(e.message || "Translation failed");
    } finally { setTranslating(false); }
  };

  const randomSample = () => setText(SAMPLES[Math.floor(Math.random() * SAMPLES.length)]);
  const randomVoice = () => {
    if (filtered.length === 0) return;
    setSelected(filtered[Math.floor(Math.random() * filtered.length)].ShortName);
  };

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const estDuration = Math.round((text.length / 14) * 10) / 10;

  return (
    <div>
      {/* Header bar */}
      <div className="border-b hairline">
        <div className="container py-8">
          <div className="mono-label text-muted-foreground mb-3">/ playground</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight">
            The <span className="italic">studio.</span>
          </h1>
        </div>
      </div>

      <div className="container py-8 grid lg:grid-cols-[1fr_360px] gap-8">
        {/* EDITOR */}
        <div className="space-y-4">
          <div className="border hairline bg-surface">
            <div className="border-b hairline px-4 py-2 flex items-center justify-between mono-label text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>// editor</span>
                <button onClick={randomSample} className="hover:text-foreground">↻ sample</button>
              </div>
              <div className="flex gap-4 tabular-nums">
                <span>{text.length}c</span>
                <span>·</span>
                <span>~{estDuration}s</span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 5000))}
              placeholder="Type or paste text here…"
              className="w-full bg-transparent p-6 min-h-[320px] resize-none font-serif text-xl md:text-2xl leading-relaxed focus:outline-none"
            />
            <div className="border-t hairline px-4 py-2 flex flex-wrap items-center gap-2 text-xs font-mono">
              <Languages className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">translate to →</span>
              <select
                value={translateTarget}
                onChange={(e) => setTranslateTarget(e.target.value)}
                className="bg-transparent border hairline px-2 py-1 text-xs"
              >
                <option value="">—</option>
                {TARGETS.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <button
                onClick={handleTranslate}
                disabled={!translateTarget || translating}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 border hairline hover:border-signal disabled:opacity-40"
              >
                {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                translate
              </button>
            </div>
          </div>

          <div className="flex items-stretch gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-sm bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? "synthesizing…" : "▸ synthesize"}
            </button>
            {audioUrl && (
              <a
                href={audioUrl}
                download={`vocalis-${Date.now()}.mp3`}
                className="inline-flex items-center gap-2 px-4 py-3 border hairline hover:border-signal transition text-xs font-mono"
              >
                <Download className="w-3.5 h-3.5" /> mp3
              </a>
            )}
          </div>

          {/* Player */}
          {audioUrl && (
            <div className="border hairline bg-surface animate-fade-in">
              <div className="px-4 py-3 border-b hairline flex items-center justify-between mono-label">
                <span className="flex items-center gap-2"><span className="signal-dot" /> on air</span>
                <span className="text-muted-foreground">{latency}ms · 1st byte</span>
              </div>
              <div className="p-4 flex items-center gap-4">
                <button
                  onClick={() => (playing ? audioRef.current?.pause() : audioRef.current?.play())}
                  className="w-12 h-12 flex items-center justify-center bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition shrink-0"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <Waveform active={playing} />
                  <div className="font-mono text-[10px] text-muted-foreground mt-2 truncate">{usedVoice}</div>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                className="w-full px-4 pb-4"
                controls
              />
            </div>
          )}
        </div>

        {/* VOICE PICKER */}
        <aside className="border hairline bg-surface flex flex-col h-[640px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-16">
          <div className="px-3 py-2 border-b hairline flex items-center justify-between mono-label text-muted-foreground">
            <span>// voices ({filtered.length})</span>
            <button onClick={randomVoice} className="hover:text-foreground"><Shuffle className="w-3 h-3 inline" /> random</button>
          </div>

          <div className="p-3 border-b hairline space-y-2">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search…"
                className="w-full bg-background border hairline pl-7 pr-2 py-1.5 text-xs font-mono focus:outline-none focus:border-signal"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-background border hairline px-2 py-1.5 text-xs font-mono">
                {languages.map((l) => <option key={l} value={l}>{langName(l)} · {l}</option>)}
              </select>
              <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value as any)} className="bg-background border hairline px-2 py-1.5 text-xs font-mono">
                <option value="all">all</option>
                <option value="Female">female</option>
                <option value="Male">male</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {voicesLoading && <div className="p-6 text-center text-xs font-mono text-muted-foreground"><Loader2 className="w-3 h-3 inline animate-spin mr-2" />loading…</div>}
            {!voicesLoading && filtered.length === 0 && <div className="p-6 text-center text-xs font-mono text-muted-foreground">no voices</div>}
            {filtered.map((v: Voice) => {
              const short = v.ShortName.split("-").slice(2).join("-").replace("Neural", "");
              return (
                <button
                  key={v.ShortName}
                  onClick={() => setSelected(v.ShortName)}
                  className={cn(
                    "w-full text-left px-3 py-2 border-b hairline last:border-0 flex items-center gap-3 transition group",
                    selected === v.ShortName ? "bg-signal/10 border-l-2 border-l-signal" : "hover:bg-surface-2"
                  )}
                >
                  <span className="text-base">{countryFlag(v.Locale)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs truncate">{short}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{v.Locale} · {v.Gender === "Female" ? "f" : "m"}</div>
                  </div>
                  {selected === v.ShortName && <ArrowUpRight className="w-3 h-3 text-signal" />}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
