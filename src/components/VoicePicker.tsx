import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play, Pause, Sparkles } from "lucide-react";
import { fetchVoices, detectLanguage, synthesize, langName, countryFlag, type Voice } from "@/lib/tts";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (shortName: string) => void;
  /** If provided, language is auto-detected from this text (debounced). */
  text?: string;
  className?: string;
  compact?: boolean;
};

const SAMPLES: Record<string, string> = {
  fr: "Bonjour, voici un aperçu de cette voix.",
  en: "Hello, here is a quick preview of this voice.",
  es: "Hola, esta es una muestra de voz.",
  de: "Hallo, hier ist eine kurze Stimmprobe.",
  it: "Ciao, ecco un'anteprima di questa voce.",
  pt: "Olá, aqui está uma prévia desta voz.",
  ja: "こんにちは、声のサンプルです。",
  zh: "你好，这是一段语音示例。",
  ar: "مرحبا، هذه عينة صوتية.",
  ru: "Привет, это пример голоса.",
};

export function VoicePicker({ value, onChange, text, className, compact }: Props) {
  const { data: voices = [], isLoading } = useQuery({
    queryKey: ["voices"], queryFn: fetchVoices, staleTime: 60 * 60 * 1000,
  });

  const [lang, setLang] = useState<string>(() => value?.split("-")[0]?.toLowerCase() || "en");
  const [autoDetected, setAutoDetected] = useState<{ lang: string; confidence: number } | null>(null);
  const [manualLang, setManualLang] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Available languages from catalog
  const languages = useMemo(
    () => Array.from(new Set(voices.map((v) => v.Locale.split("-")[0].toLowerCase()))).sort(),
    [voices]
  );

  // Voices for current language
  const langVoices = useMemo(
    () => voices.filter((v) => v.Locale.toLowerCase().startsWith(lang)),
    [voices, lang]
  );
  const females = langVoices.filter((v) => v.Gender === "Female");
  const males = langVoices.filter((v) => v.Gender === "Male");

  // Debounced auto-detect from text
  useEffect(() => {
    if (!text || manualLang) return;
    const trimmed = text.trim();
    if (trimmed.length < 12) return;
    const handle = setTimeout(async () => {
      try {
        const res = await detectLanguage(trimmed.slice(0, 2000));
        if (res?.lang && languages.includes(res.lang)) {
          setAutoDetected({ lang: res.lang, confidence: res.confidence });
          setLang(res.lang);
        }
      } catch { /* silent */ }
    }, 600);
    return () => clearTimeout(handle);
  }, [text, manualLang, languages]);

  // Ensure selected voice matches the current language
  useEffect(() => {
    if (!langVoices.length) return;
    const current = voices.find((v) => v.ShortName === value);
    if (!current || !current.Locale.toLowerCase().startsWith(lang)) {
      // Pick a sensible default: first female, else first available
      const pick = (females[0] || langVoices[0]);
      if (pick && pick.ShortName !== value) onChange(pick.ShortName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, langVoices.length]);

  const onLangChange = (l: string) => {
    setManualLang(true);
    setLang(l);
  };

  const preview = async () => {
    if (!value) return;
    if (previewing && audioRef.current) {
      audioRef.current.pause();
      setPreviewing(false);
      return;
    }
    setPreviewing(true);
    try {
      const sample = SAMPLES[lang] || SAMPLES.en;
      const { blob } = await synthesize(sample, value);
      const a = new Audio(URL.createObjectURL(blob));
      audioRef.current = a;
      a.onended = () => setPreviewing(false);
      await a.play();
    } catch (e: any) {
      toast.error("Preview failed", { description: e.message });
      setPreviewing(false);
    }
  };

  if (isLoading) {
    return <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading voices…</div>;
  }

  return (
    <div className={className}>
      <div className={`grid ${compact ? "grid-cols-2" : "md:grid-cols-2"} gap-3`}>
        <div>
          <div className="mono-label text-muted-foreground mb-1.5 flex items-center gap-2">
            Language
            {autoDetected && !manualLang && (
              <span className="inline-flex items-center gap-1 text-signal text-[10px]">
                <Sparkles className="w-2.5 h-2.5" /> auto · {Math.round(autoDetected.confidence * 100)}%
              </span>
            )}
          </div>
          <Select value={lang} onValueChange={onLangChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue>
                <span className="mr-2">{countryFlag(`xx-${lang.toUpperCase()}`) === "🌐" ? "🌐" : ""}</span>
                {langName(lang)} <span className="text-muted-foreground ml-1">· {lang}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {languages.map((l) => (
                <SelectItem key={l} value={l}>
                  {langName(l)} <span className="text-muted-foreground ml-1">· {l}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mono-label text-muted-foreground mb-1.5 flex items-center justify-between">
            <span>Voice ({langVoices.length})</span>
            <button
              onClick={preview}
              disabled={!value}
              className="inline-flex items-center gap-1 text-[10px] text-signal hover:opacity-80 disabled:opacity-40"
            >
              {previewing ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              preview
            </button>
          </div>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {females.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Female</SelectLabel>
                  {females.map((v) => (
                    <SelectItem key={v.ShortName} value={v.ShortName}>
                      <VoiceLabel v={v} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {males.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Male</SelectLabel>
                  {males.map((v) => (
                    <SelectItem key={v.ShortName} value={v.ShortName}>
                      <VoiceLabel v={v} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {langVoices.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">No voice for this language</div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function VoiceLabel({ v }: { v: Voice }) {
  const shortLabel = v.ShortName.split("-").slice(-1)[0].replace("Neural", "");
  return (
    <span className="inline-flex items-center gap-2">
      <span>{countryFlag(v.Locale)}</span>
      <span className="font-medium">{shortLabel}</span>
      <span className="text-muted-foreground text-[10px] font-mono">{v.Locale}</span>
    </span>
  );
}
