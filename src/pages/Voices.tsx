import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, Loader2, Copy, Check, Pause, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { fetchVoices, synthesize, detectLanguage, langName, countryFlag, type Voice } from "@/lib/tts";
import { cn } from "@/lib/utils";

const SAMPLES: Record<string, string> = {
  fr: "Bonjour, comment allez-vous ?", en: "Hello, how are you today?",
  es: "Hola, ¿cómo estás?", de: "Hallo, wie geht es dir?",
  it: "Ciao, come stai?", pt: "Olá, como você está?",
  ja: "こんにちは、お元気ですか", zh: "你好，最近怎么样",
  ar: "مرحبا، كيف حالك", ru: "Привет, как дела",
};

export default function Voices() {
  const { data: voices = [], isLoading } = useQuery({ queryKey: ["voices"], queryFn: fetchVoices, staleTime: 60 * 60 * 1000 });
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [gender, setGender] = useState("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [detectText, setDetectText] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{ lang: string; confidence: number } | null>(null);

  const onDetect = async () => {
    if (!detectText.trim()) return;
    setDetecting(true);
    try {
      const r = await detectLanguage(detectText.slice(0, 2000));
      if (r?.lang) {
        setDetectedInfo({ lang: r.lang, confidence: r.confidence });
        setLang(r.lang);
        toast.success(`Detected: ${langName(r.lang)} (${Math.round(r.confidence * 100)}%)`);
      }
    } catch (e: any) {
      toast.error("Detection failed", { description: e.message });
    } finally {
      setDetecting(false);
    }
  };

  const languages = useMemo(() => Array.from(new Set(voices.map((v) => v.Locale.split("-")[0]))).sort(), [voices]);

  const filtered = useMemo(() => voices.filter((v) => {
    if (lang !== "all" && !v.Locale.startsWith(lang)) return false;
    if (gender !== "all" && v.Gender !== gender) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!v.ShortName.toLowerCase().includes(s) && !v.Locale.toLowerCase().includes(s) && !langName(v.Locale).toLowerCase().includes(s)) return false;
    }
    return true;
  }), [voices, lang, gender, search]);

  const onPlay = async (v: Voice) => {
    if (playing === v.ShortName) return setPlaying(null);
    setPlaying(v.ShortName);
    try {
      const code = v.Locale.split("-")[0];
      const text = SAMPLES[code] || SAMPLES.en;
      const { blob } = await synthesize(text, v.ShortName);
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => setPlaying(null);
      await audio.play();
    } catch (e: any) { toast.error(e.message); setPlaying(null); }
  };

  const onCopy = (v: Voice) => {
    navigator.clipboard.writeText(v.ShortName);
    setCopied(v.ShortName);
    toast.success("ShortName copied");
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="border-b hairline">
        <div className="container py-8">
          <div className="mono-label text-muted-foreground mb-3">/ voices · catalog</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight">
            The <span className="italic">library.</span>
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-3">
            {voices.length || "…"} neural voices · {languages.length} languages · click to preview
          </p>
        </div>
      </div>

      <div className="container py-6 grid lg:grid-cols-[220px_1fr] gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="lg:sticky lg:top-16 lg:self-start space-y-6 text-xs font-mono">
          <div>
            <div className="mono-label text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-signal" /> // detect from text
            </div>
            <textarea
              value={detectText} onChange={(e) => setDetectText(e.target.value)}
              placeholder="Paste any text…"
              rows={3}
              className="w-full bg-background border hairline px-2 py-1.5 text-xs focus:outline-none focus:border-signal resize-none"
            />
            <button
              onClick={onDetect}
              disabled={detecting || !detectText.trim()}
              className="mt-1.5 w-full bg-signal text-accent-foreground py-1.5 text-[11px] font-medium disabled:opacity-40 inline-flex items-center justify-center gap-1"
            >
              {detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : "→ detect & filter"}
            </button>
            {detectedInfo && (
              <div className="mt-1.5 text-[10px] text-signal">
                {langName(detectedInfo.lang)} · {Math.round(detectedInfo.confidence * 100)}%
              </div>
            )}
          </div>

          <div>
            <div className="mono-label text-muted-foreground mb-2">// search</div>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="aria, fr, japan…"
                className="w-full bg-background border hairline pl-7 pr-2 py-2 text-xs focus:outline-none focus:border-signal"
              />
            </div>
          </div>

          <div>
            <div className="mono-label text-muted-foreground mb-2">// language</div>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              <button onClick={() => setLang("all")} className={cn("block w-full text-left py-1 px-2", lang === "all" ? "text-signal" : "text-muted-foreground hover:text-foreground")}>
                all ({voices.length})
              </button>
              {languages.map((l) => (
                <button key={l} onClick={() => setLang(l)} className={cn("block w-full text-left py-1 px-2", lang === l ? "text-signal" : "text-muted-foreground hover:text-foreground")}>
                  {langName(l)} · {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mono-label text-muted-foreground mb-2">// gender</div>
            <div className="flex gap-2">
              {[["all", "all"], ["Female", "f"], ["Male", "m"]].map(([v, l]) => (
                <button key={v} onClick={() => setGender(v)} className={cn("px-3 py-1 border hairline", gender === v ? "border-signal text-signal" : "text-muted-foreground hover:text-foreground")}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="text-muted-foreground">→ {filtered.length} results</div>
        </aside>

        {/* LIST */}
        <div>
          {isLoading && <div className="text-center py-20"><Loader2 className="w-4 h-4 animate-spin text-signal inline" /></div>}

          <div className="border hairline divide-y hairline">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[40px_1fr_1fr_60px_120px] gap-4 px-4 py-2 mono-label text-muted-foreground bg-surface">
              <span></span>
              <span>shortname</span>
              <span>language</span>
              <span>gender</span>
              <span className="text-right">actions</span>
            </div>

            {filtered.map((v) => (
              <div key={v.ShortName} className="grid grid-cols-[40px_1fr_60px] md:grid-cols-[40px_1fr_1fr_60px_120px] gap-4 px-4 py-3 items-center hover:bg-surface transition group">
                <span className="text-xl">{countryFlag(v.Locale)}</span>
                <div className="min-w-0">
                  <div className="font-mono text-xs truncate">{v.ShortName}</div>
                  <div className="md:hidden font-mono text-[10px] text-muted-foreground">{langName(v.Locale)} · {v.Gender === "Female" ? "f" : "m"}</div>
                </div>
                <div className="hidden md:block font-mono text-xs text-muted-foreground">{langName(v.Locale)} · {v.Locale}</div>
                <div className="hidden md:block font-mono text-xs text-muted-foreground">{v.Gender === "Female" ? "female" : "male"}</div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onPlay(v)}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center border hairline transition",
                      playing === v.ShortName ? "bg-signal text-accent-foreground border-signal" : "hover:border-signal hover:text-signal"
                    )}
                    title="preview"
                  >
                    {playing === v.ShortName ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => onCopy(v)}
                    className="w-7 h-7 flex items-center justify-center border hairline hover:border-signal hover:text-signal transition"
                    title="copy shortname"
                  >
                    {copied === v.ShortName ? <Check className="w-3 h-3 text-signal" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}

            {!isLoading && filtered.length === 0 && (
              <div className="px-4 py-12 text-center text-xs font-mono text-muted-foreground">no voices match these filters</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
