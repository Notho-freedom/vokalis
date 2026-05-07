import { TTS_BACKEND_URL } from "./constants";

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
