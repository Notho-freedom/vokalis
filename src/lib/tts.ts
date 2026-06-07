import { TTS_BACKEND_URL, TTS_BACKEND_FALLBACK_URLS } from "./constants";

/** All candidate base URLs, primary first. */
const BACKENDS = [TTS_BACKEND_URL, ...TTS_BACKEND_FALLBACK_URLS];

/** Tracks the last backend that responded OK so subsequent calls hit it first. */
let activeBackend = TTS_BACKEND_URL;

/**
 * Fetch with automatic failover across backends.
 * Tries the active backend first, then falls back to the others on network error or 5xx.
 */
export async function ttsFetch(path: string, init?: RequestInit, timeoutMs = 45_000): Promise<Response> {
  const ordered = [activeBackend, ...BACKENDS.filter((b) => b !== activeBackend)];
  let lastErr: unknown = null;
  for (const base of ordered) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(`${base}${path}`, { ...init, signal: ctrl.signal });
      clearTimeout(to);
      if (r.ok || (r.status >= 400 && r.status < 500)) {
        activeBackend = base;
        return r;
      }
      lastErr = new Error(`${base} → ${r.status}`);
    } catch (e) {
      clearTimeout(to);
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All TTS backends unreachable");
}

export function getActiveBackend() { return activeBackend; }


export type Voice = {
  Name: string;
  ShortName: string;
  Gender: "Male" | "Female";
  Locale: string;
  FriendlyName?: string;
  SuggestedCodec?: string;
  Status?: string;
  VoiceTag?: { ContentCategories?: string[]; VoicePersonalities?: string[] };
};

export async function fetchVoices(): Promise<Voice[]> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/voices`);
  if (!r.ok) throw new Error("Failed to load voices");
  return r.json();
}

export async function synthesize(text: string, voice: string): Promise<{ blob: Blob; usedVoice: string }> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!r.ok) throw new Error(`TTS failed: ${r.status}`);
  const usedVoice = r.headers.get("X-Used-Voice") || voice;
  const blob = await r.blob();
  return { blob, usedVoice };
}

/** Streaming variant — returns a ReadableStream of MP3 chunks. */
export async function synthesizeStream(text: string, voice: string): Promise<{ stream: ReadableStream<Uint8Array>; usedVoice: string }> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/tts/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!r.ok || !r.body) throw new Error(`TTS stream failed: ${r.status}`);
  return { stream: r.body, usedVoice: r.headers.get("X-Used-Voice") || voice };
}

export type DialogueSegment = { voice: string; text: string; rate?: string; pitch?: string; pause_after_ms?: number };

export async function synthesizeDialogue(segments: DialogueSegment[]): Promise<Blob> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/tts/dialogue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ segments }),
  });
  if (!r.ok) throw new Error(`Dialogue failed: ${r.status}`);
  return r.blob();
}

export type CaptionCue = { start_ms: number; end_ms: number; text: string };
export type CaptionWord = { offset_ms: number; text: string };

export async function fetchCaptions(text: string, voice: string, words_per_cue = 6):
  Promise<{ cues: CaptionCue[]; words: CaptionWord[] }> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/captions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, format: "json", words_per_cue }),
  });
  if (!r.ok) throw new Error(`Captions failed: ${r.status}`);
  return r.json();
}

export async function fetchCaptionFile(text: string, voice: string, format: "srt" | "vtt" = "srt"): Promise<string> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/captions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, format }),
  });
  if (!r.ok) throw new Error(`Captions failed: ${r.status}`);
  return r.text();
}

export async function fetchHealth(): Promise<any> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/health`);
  return r.json();
}

export async function detectLanguageVoices(text: string) {
  const r = await fetch(`${TTS_BACKEND_URL}/api/voices-by-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error("detect failed");
  return r.json();
}

export async function detectLanguage(text: string): Promise<{ lang: string; confidence: number; alternates: any[] }> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/detect-language`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error("detect failed");
  return r.json();
}

export async function translateText(text: string, target_lang: string, source_lang: string = "auto"): Promise<{ translated: string; source_lang: string; target_lang: string }> {
  const r = await fetch(`${TTS_BACKEND_URL}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_lang, source_lang }),
  });
  if (!r.ok) throw new Error("translate failed");
  return r.json();
}

export const LANG_NAMES: Record<string, string> = {
  af: "Afrikaans", am: "Amharique", ar: "Arabe", az: "Azerbaïdjanais", bg: "Bulgare", bn: "Bengali",
  bs: "Bosniaque", ca: "Catalan", cs: "Tchèque", cy: "Gallois", da: "Danois", de: "Allemand",
  el: "Grec", en: "Anglais", es: "Espagnol", et: "Estonien", eu: "Basque", fa: "Persan",
  fi: "Finnois", fil: "Filipino", fr: "Français", ga: "Irlandais", gl: "Galicien", gu: "Gujarati",
  he: "Hébreu", hi: "Hindi", hr: "Croate", hu: "Hongrois", hy: "Arménien", id: "Indonésien",
  is: "Islandais", it: "Italien", ja: "Japonais", jv: "Javanais", ka: "Géorgien", kk: "Kazakh",
  km: "Khmer", kn: "Kannada", ko: "Coréen", lo: "Lao", lt: "Lituanien", lv: "Letton",
  mk: "Macédonien", ml: "Malayalam", mn: "Mongol", mr: "Marathi", ms: "Malais", mt: "Maltais",
  my: "Birman", nb: "Norvégien", ne: "Népalais", nl: "Néerlandais", pl: "Polonais", ps: "Pachto",
  pt: "Portugais", ro: "Roumain", ru: "Russe", si: "Cingalais", sk: "Slovaque", sl: "Slovène",
  so: "Somali", sq: "Albanais", sr: "Serbe", su: "Sundanais", sv: "Suédois", sw: "Swahili",
  ta: "Tamoul", te: "Telugu", th: "Thaï", tr: "Turc", uk: "Ukrainien", ur: "Ourdou",
  uz: "Ouzbek", vi: "Vietnamien", wuu: "Wu", yue: "Cantonais", zh: "Chinois", zu: "Zoulou",
};

export function langName(locale: string): string {
  const code = locale.split("-")[0].toLowerCase();
  return LANG_NAMES[code] || code.toUpperCase();
}

export function countryFlag(locale: string): string {
  const cc = locale.split("-")[1]?.toUpperCase();
  if (!cc || cc.length !== 2) return "🌐";
  return String.fromCodePoint(...cc.split("").map((c) => 127397 + c.charCodeAt(0)));
}
