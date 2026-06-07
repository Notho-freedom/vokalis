export const APP_NAME = "Vocalis";
export const APP_TAGLINE = "Voix synthétique. Gratuite. Sans limite.";
export const TTS_BACKEND_URL = "https://vokalis.onrender.com";
/** Fallback used automatically when the primary backend is unreachable / 5xx. */
export const TTS_BACKEND_FALLBACK_URLS = ["https://low-tts.onrender.com"];
export const PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/tts-proxy`;
