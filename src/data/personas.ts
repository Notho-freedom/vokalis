import portrait1 from "@/assets/voice-portrait-1.jpg";
import portrait2 from "@/assets/voice-portrait-2.jpg";
import portrait3 from "@/assets/voice-portrait-3.jpg";
import portrait4 from "@/assets/voice-portrait-4.jpg";
import portrait5 from "@/assets/voice-portrait-5.jpg";
import portrait6 from "@/assets/voice-portrait-6.jpg";

export type Persona = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  voice: string;        // ShortName edge-tts
  rate: number;         // -50..50
  pitch: number;        // -50..50
  sample: string;
  emoji: string;
  portrait: string;
  category: "narration" | "broadcast" | "wellness" | "creative" | "business";
};

export const PERSONAS: Persona[] = [
  {
    id: "thriller-narrator",
    name: "Thriller Narrator",
    tagline: "Suspense in every syllable.",
    description: "Slow, deliberate, low. Built for crime fiction, true-crime podcasts, and dark trailers.",
    voice: "en-US-GuyNeural",
    rate: -10, pitch: -8,
    sample: "She turned the corner. The lights flickered. Something was waiting in the dark.",
    emoji: "🌑", portrait: portrait4, category: "narration",
  },
  {
    id: "fm-news",
    name: "FM News Anchor",
    tagline: "The 8 o'clock voice.",
    description: "Clean, measured, authoritative. Optimized for news bulletins and headlines.",
    voice: "en-US-JennyNeural",
    rate: 5, pitch: 0,
    sample: "Breaking news. Markets close higher as inflation slows. Full report after the break.",
    emoji: "📻", portrait: portrait1, category: "broadcast",
  },
  {
    id: "calm-meditation",
    name: "Mindful Guide",
    tagline: "Soft. Present. Grounded.",
    description: "Whispered cadence for meditation, sleep stories, and breathing exercises.",
    voice: "en-US-AvaMultilingualNeural",
    rate: -25, pitch: -5,
    sample: "Breathe in. Hold. And gently let it go. You are exactly where you need to be.",
    emoji: "🌿", portrait: portrait3, category: "wellness",
  },
  {
    id: "explainer-yt",
    name: "YouTube Explainer",
    tagline: "Friendly, fast, hooked.",
    description: "Energetic and clear. Perfect for educational videos and how-to content.",
    voice: "en-US-AndrewNeural",
    rate: 12, pitch: 3,
    sample: "Today we're going to break down exactly how this works in three simple steps.",
    emoji: "📺", portrait: portrait6, category: "creative",
  },
  {
    id: "luxury-ad",
    name: "Luxury Advertiser",
    tagline: "Velvet and gold.",
    description: "Smooth, confident, premium. The voice of high-end brands and cinematic ads.",
    voice: "en-US-SteffanNeural",
    rate: -8, pitch: -3,
    sample: "Crafted in Switzerland. Worn by those who never compromise.",
    emoji: "🥃", portrait: portrait2, category: "business",
  },
  {
    id: "audiobook-romance",
    name: "Romance Reader",
    tagline: "Warm, breathy, intimate.",
    description: "Designed for audiobook romance, emotional fiction, and character-driven prose.",
    voice: "en-GB-SoniaNeural",
    rate: -5, pitch: 2,
    sample: "He took her hand, and the entire room disappeared around them.",
    emoji: "🌹", portrait: portrait5, category: "narration",
  },
  {
    id: "ted-conference",
    name: "TED Speaker",
    tagline: "Big ideas, well-paced.",
    description: "Articulate and inspiring. For talks, keynotes, and thought-leadership content.",
    voice: "en-US-EmmaNeural",
    rate: 0, pitch: 0,
    sample: "What if everything we thought we knew about creativity was completely wrong?",
    emoji: "💡", portrait: portrait3, category: "business",
  },
  {
    id: "nature-doc",
    name: "Nature Documentary",
    tagline: "Attenborough-grade.",
    description: "Hushed wonder. Built for nature footage, science explainers, and slow content.",
    voice: "en-GB-RyanNeural",
    rate: -12, pitch: -2,
    sample: "Here, in the canopy, a single drop of rain becomes a world of its own.",
    emoji: "🦋", portrait: portrait4, category: "narration",
  },
  {
    id: "cartoon",
    name: "Cartoon Sidekick",
    tagline: "Big, bouncy, playful.",
    description: "High-energy and expressive. For animation, kids' content, and playful brands.",
    voice: "en-US-AnaNeural",
    rate: 18, pitch: 15,
    sample: "Whoa! Did you see that?! That was the coolest thing ever!",
    emoji: "🎈", portrait: portrait6, category: "creative",
  },
  {
    id: "tech-tutorial",
    name: "Calm Tutorial",
    tagline: "Patient. Precise. Pleasant.",
    description: "Even-paced for technical walkthroughs, software demos, and onboarding.",
    voice: "en-US-BrianNeural",
    rate: -3, pitch: 0,
    sample: "Open the terminal and run npm install. We'll wait for the dependencies to resolve.",
    emoji: "🛠", portrait: portrait2, category: "business",
  },
  {
    id: "investor-pitch",
    name: "Investor Pitch",
    tagline: "Confident. Focused. Crisp.",
    description: "For founder reels, deck voiceovers, and high-stakes pitch videos.",
    voice: "en-US-EricNeural",
    rate: 3, pitch: -2,
    sample: "We've built the only platform that combines speed, scale, and simplicity.",
    emoji: "📈", portrait: portrait4, category: "business",
  },
  {
    id: "cinema-trailer",
    name: "Cinema Trailer",
    tagline: "In a world…",
    description: "Deep, slow, monumental. Movie trailer voice for promos and intros.",
    voice: "en-US-DavisNeural",
    rate: -18, pitch: -12,
    sample: "In a world where silence reigned… one voice would change everything.",
    emoji: "🎬", portrait: portrait4, category: "creative",
  },
];

export const PERSONA_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "narration", label: "Narration" },
  { id: "broadcast", label: "Broadcast" },
  { id: "wellness", label: "Wellness" },
  { id: "creative", label: "Creative" },
  { id: "business", label: "Business" },
];
