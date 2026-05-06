import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchVoices, synthesize, langName, countryFlag, type Voice } from "@/lib/tts";
import { cn } from "@/lib/utils";

const SAMPLES: Record<string, string> = {
  fr: "Bonjour, comment allez-vous ?", en: "Hello, how are you today?",
  es: "Hola, ¿cómo estás?", de: "Hallo, wie geht es dir?",
  it: "Ciao, come stai?", pt: "Olá, como você está?",
  ja: "こんにちは、お元気ですか", zh: "你好，最近怎么样",
  ar: "مرحبا، كيف حالك", ru: "Привет, как дела",
};

function VoiceCard({ v, playing, onPlay, copied, onCopy }: any) {
  return (
    <div className="group p-4 rounded-xl border border-border bg-surface hover:border-brand/40 hover:shadow-glow transition">
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0">{countryFlag(v.Locale)}</div>
        <div className="min-w-0 flex-1">
          <div className="font-heading font-semibold text-sm truncate">{v.ShortName.split("-").slice(2).join("-").replace("Neural", "")}</div>
          <div className="text-xs text-muted-foreground">{langName(v.Locale)} · {v.Locale}</div>
        </div>
        <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded uppercase",
          v.Gender === "Female" ? "bg-pink-500/10 text-pink-400" : "bg-blue-500/10 text-blue-400")}>
          {v.Gender === "Female" ? "F" : "M"}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onPlay} disabled={playing} className="flex-1 h-8 text-xs">
          {playing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
          Écouter
        </Button>
        <Button size="sm" variant="ghost" onClick={onCopy} className="h-8 text-xs">
          {copied ? <Check className="w-3 h-3 text-brand-2" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <div className="mt-2 font-mono text-[10px] text-muted-foreground truncate">{v.ShortName}</div>
    </div>
  );
}

export default function Voices() {
  const { data: voices = [], isLoading } = useQuery({ queryKey: ["voices"], queryFn: fetchVoices, staleTime: 60 * 60 * 1000 });
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [gender, setGender] = useState("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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
    toast.success("ShortName copié");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="max-w-3xl mb-10">
        <div className="text-xs font-mono uppercase tracking-wider text-brand mb-2">Bibliothèque</div>
        <h1 className="font-heading font-bold text-4xl md:text-5xl tracking-tight">Toutes les voix.</h1>
        <p className="text-muted-foreground mt-2">{voices.length || "..."} voix neuronales filtrables. Clique pour écouter un aperçu.</p>
      </div>

      <div className="sticky top-16 z-10 mb-6 rounded-xl border border-border glass p-3 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background" />
        </div>
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-44 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Toutes les langues</SelectItem>
            {languages.map((l) => <SelectItem key={l} value={l}>{langName(l)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous genres</SelectItem>
            <SelectItem value="Female">Féminines</SelectItem>
            <SelectItem value="Male">Masculines</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground self-center px-2 font-mono">{filtered.length} résultats</div>
      </div>

      {isLoading && <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand inline" /></div>}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((v) => (
          <VoiceCard key={v.ShortName} v={v} playing={playing === v.ShortName} onPlay={() => onPlay(v)}
            copied={copied === v.ShortName} onCopy={() => onCopy(v)} />
        ))}
      </div>
    </div>
  );
}
