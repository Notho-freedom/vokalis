import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, Download, Copy, Loader2, Wand2, Save } from "lucide-react";
import { synthesize, fetchVoices, type Voice, langName, countryFlag } from "@/lib/tts";
import { PERSONAS } from "@/data/personas";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Playground() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [text, setText] = useState("Welcome to Vocalis. Type or paste any text — we'll bring it to life.");
  const [voice, setVoice] = useState("en-US-AvaMultilingualNeural");
  const [rate, setRate] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    fetchVoices().then(setVoices).catch(() => toast.error("Could not load voices"));
  }, []);

  useEffect(() => {
    const pid = params.get("persona");
    if (pid) {
      const p = PERSONAS.find((x) => x.id === pid);
      if (p) {
        setVoice(p.voice);
        setRate(p.rate);
        setPitch(p.pitch);
        setText(p.sample);
        toast.success(`${p.emoji} ${p.name} loaded`);
      }
    }
  }, [params]);

  const filteredVoices = voices.filter(
    (v) =>
      v.ShortName.toLowerCase().includes(search.toLowerCase()) ||
      langName(v.Locale).toLowerCase().includes(search.toLowerCase()) ||
      v.Locale.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 200);

  const generate = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { blob } = await synthesize(text, voice);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      audioRef.current.src = url;
      audioRef.current.onended = () => setPlaying(false);
      await audioRef.current.play();
      setPlaying(true);
    } catch (e: any) {
      toast.error("Generation failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const togglePlay = () => {
    if (!audioUrl) return generate();
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const saveProject = async () => {
    if (!user) { toast.error("Sign in to save projects"); return; }
    if (!audioUrl) { toast.error("Generate audio first"); return; }
    try {
      const { error } = await supabase.from("projects").insert({
        user_id: user.id, title: text.slice(0, 60), text, voice, rate, pitch, source: "playground"
      });
      if (error) throw error;
      toast.success("Saved to Projects");
    } catch (e: any) { toast.error(e.message); }
  };

  const charCount = text.length;
  const estSeconds = Math.ceil(charCount / 15);

  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-12 pb-32">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="section-num mb-3">Playground</div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">The studio.</h1>
        </div>
        <Link to="/personas" className="text-sm text-signal hover:underline">
          ✦ Browse 12 personas →
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-px bg-border min-h-[600px]">
        {/* TEXT EDITOR */}
        <div className="bg-background p-8 flex flex-col">
          <div className="mono-label text-muted-foreground mb-4 flex items-center justify-between">
            <span>Editor</span>
            <span>{charCount.toLocaleString()} chars · ~{estSeconds}s</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste anything…"
            className="flex-1 bg-transparent border-none outline-none resize-none font-display text-2xl md:text-3xl leading-snug text-foreground placeholder:text-muted-foreground/50 min-h-[400px]"
            maxLength={5000}
          />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <div className="mono-label text-muted-foreground mb-2 flex justify-between"><span>Rate</span><span>{rate > 0 ? "+" : ""}{rate}</span></div>
              <input type="range" min={-50} max={50} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-[hsl(var(--signal))]" />
            </div>
            <div>
              <div className="mono-label text-muted-foreground mb-2 flex justify-between"><span>Pitch</span><span>{pitch > 0 ? "+" : ""}{pitch}</span></div>
              <input type="range" min={-50} max={50} value={pitch} onChange={(e) => setPitch(+e.target.value)} className="w-full accent-[hsl(var(--signal))]" />
            </div>
          </div>
        </div>

        {/* VOICE PANEL */}
        <div className="bg-card p-6 flex flex-col">
          <div className="mono-label text-muted-foreground mb-4">Voice · {voices.length} available</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, language…"
            className="w-full bg-background border hairline rounded-md px-3 py-2 text-sm mb-4"
          />
          <div className="flex-1 overflow-auto space-y-1 max-h-[480px] pr-1">
            {filteredVoices.map((v) => (
              <button
                key={v.ShortName}
                onClick={() => setVoice(v.ShortName)}
                className={`w-full text-left px-3 py-2 text-xs rounded-md transition flex items-center gap-2 ${
                  voice === v.ShortName ? "bg-signal text-accent-foreground" : "hover:bg-background"
                }`}
              >
                <span>{countryFlag(v.Locale)}</span>
                <span className="font-mono truncate flex-1">{v.ShortName.replace("Neural", "")}</span>
                <span className="opacity-60">{v.Gender[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSPORT BAR */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t hairline bg-background/90 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center gap-4">
          <button
            onClick={busy ? undefined : (audioUrl ? togglePlay : generate)}
            disabled={busy || !text.trim()}
            className="w-12 h-12 rounded-full bg-signal text-accent-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition glow-signal"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{voice}</div>
            <div className="text-[11px] font-mono text-muted-foreground">
              {busy ? "synthesizing…" : audioUrl ? "ready" : "press play to synthesize"}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {playing && <span className="audio-bars"><span/><span/><span/><span/><span/></span>}
            <button
              onClick={generate}
              disabled={busy}
              className="px-3 py-2 border hairline rounded-md text-xs hover:bg-secondary transition inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" /> Regenerate
            </button>
            <button
              onClick={saveProject}
              disabled={!audioUrl}
              className="px-3 py-2 border hairline rounded-md text-xs hover:bg-secondary transition inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            {audioUrl && (
              <a href={audioUrl} download="vocalis.mp3" className="px-3 py-2 border hairline rounded-md text-xs hover:bg-secondary transition inline-flex items-center gap-2">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
