import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play, Download, Sparkles, Mic, Search, Star, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchVoices, synthesize, langName, countryFlag, type Voice } from "@/lib/tts";
import { cn } from "@/lib/utils";

const SAMPLE_TEXTS = [
  "Bonjour, bienvenue sur Vocalis. La synthèse vocale n'a jamais été aussi simple.",
  "Hello and welcome. Today we're going to explore the future of voice technology.",
  "L'intelligence artificielle transforme la façon dont nous interagissons avec les machines.",
];

export default function Playground() {
  const [text, setText] = useState(SAMPLE_TEXTS[0]);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<string>("fr");
  const [selected, setSelected] = useState<string>("fr-FR-DeniseNeural");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [usedVoice, setUsedVoice] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: voices = [], isLoading: voicesLoading } = useQuery({
    queryKey: ["voices"], queryFn: fetchVoices, staleTime: 60 * 60 * 1000,
  });

  const languages = useMemo(() => {
    const set = new Set<string>();
    voices.forEach((v) => set.add(v.Locale.split("-")[0]));
    return Array.from(set).sort();
  }, [voices]);

  const filtered = useMemo(() => {
    return voices.filter((v) => {
      if (lang && !v.Locale.toLowerCase().startsWith(lang.toLowerCase())) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!v.ShortName.toLowerCase().includes(s) && !v.Locale.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [voices, lang, search]);

  const handleGenerate = async () => {
    if (!text.trim()) return toast.error("Saisis du texte");
    setLoading(true); setAudioUrl(null); setUsedVoice(null);
    try {
      const { blob, usedVoice } = await synthesize(text, selected);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url); setUsedVoice(usedVoice);
      setTimeout(() => audioRef.current?.play(), 150);
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  return (
    <div className="container py-10 md:py-14">
      <div className="max-w-3xl mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-brand mb-2">Playground</div>
        <h1 className="font-heading font-bold text-4xl md:text-5xl tracking-tight">Teste les voix en direct</h1>
        <p className="text-muted-foreground mt-2">Choisis une voix, écris un texte, génère un MP3. Aussi simple que ça.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 5000))}
              placeholder="Écris ton texte ici..."
              className="min-h-[280px] resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0 p-5" />
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground bg-surface-2">
              <span>{text.length} / 5 000 caractères</span>
              <button className="hover:text-foreground" onClick={() => setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)])}>
                <Sparkles className="w-3 h-3 inline mr-1" />Exemple aléatoire
              </button>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !text.trim()}
            size="lg" className="w-full bg-gradient-brand text-white hover:opacity-90 shadow-glow h-12 text-base">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Synthèse en cours...</> : <><Mic className="w-4 h-4 mr-2" />Générer la voix</>}
          </Button>

          {audioUrl && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-2 p-5">
              <div className="flex items-center gap-3">
                <Button size="icon" onClick={() => { if (playing) audioRef.current?.pause(); else audioRef.current?.play(); }}
                  className="bg-gradient-brand text-white hover:opacity-90 w-12 h-12 rounded-full shadow-glow shrink-0">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <div className="flex-1">
                  <div className="text-xs font-mono text-muted-foreground mb-1">VOIX UTILISÉE</div>
                  <div className="font-mono text-sm">{usedVoice}</div>
                </div>
                <Button asChild variant="outline" size="icon" className="w-10 h-10">
                  <a href={audioUrl} download={`vocalis-${Date.now()}.mp3`}><Download className="w-4 h-4" /></a>
                </Button>
              </div>
              <audio ref={audioRef} src={audioUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)} className="w-full mt-4" controls />
            </motion.div>
          )}
        </div>

        {/* Voice picker */}
        <div className="rounded-xl border border-border bg-surface flex flex-col h-[600px] lg:h-auto">
          <div className="p-4 border-b border-border space-y-3">
            <div className="font-heading font-semibold text-sm">Sélection de la voix</div>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>{langName(l)} <span className="text-muted-foreground text-xs ml-1">({l})</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher une voix..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[480px]">
            {voicesLoading && <div className="text-center text-sm text-muted-foreground py-8"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Chargement...</div>}
            {!voicesLoading && filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">Aucune voix.</div>}
            {filtered.map((v) => (
              <button key={v.ShortName} onClick={() => setSelected(v.ShortName)}
                className={cn("w-full text-left p-3 rounded-lg border transition flex items-center gap-3",
                  selected === v.ShortName
                    ? "border-brand bg-brand/5 shadow-glow"
                    : "border-transparent hover:border-border hover:bg-surface-2")}>
                <span className="text-xl shrink-0">{countryFlag(v.Locale)}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-mono truncate">{v.ShortName.split("-").slice(2).join("-").replace("Neural", "")}</div>
                  <div className="text-xs text-muted-foreground">{v.Locale} · {v.Gender === "Female" ? "Féminine" : "Masculine"}</div>
                </div>
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded uppercase",
                  v.Gender === "Female" ? "bg-pink-500/10 text-pink-400" : "bg-blue-500/10 text-blue-400")}>
                  {v.Gender === "Female" ? "F" : "M"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
