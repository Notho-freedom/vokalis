import thriller from "@/assets/persona-thriller.jpg";
import fmnews from "@/assets/persona-fmnews.jpg";
import meditation from "@/assets/persona-meditation.jpg";
import yt from "@/assets/persona-yt.jpg";
import luxury from "@/assets/persona-luxury.jpg";
import romance from "@/assets/persona-romance.jpg";
import ted from "@/assets/persona-ted.jpg";
import nature from "@/assets/persona-nature.jpg";
import cartoon from "@/assets/persona-cartoon.jpg";
import tutorial from "@/assets/persona-tutorial.jpg";
import investor from "@/assets/persona-investor.jpg";
import trailer from "@/assets/persona-trailer.jpg";

export type Persona = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  voice: string;
  rate: number;
  pitch: number;
  sample: string;
  emoji: string;
  portrait: string;
  category: "narration" | "broadcast" | "wellness" | "creative" | "business";
};

export const PERSONAS: Persona[] = [
  { id: "thriller-narrator", name: "Thriller Narrator", tagline: "Suspense in every syllable.",
    description: "Slow, deliberate, low. Built for crime fiction, true-crime podcasts, and dark trailers.",
    voice: "en-US-GuyNeural", rate: -10, pitch: -8,
    sample: "She turned the corner. The lights flickered. Something was waiting in the dark.",
    emoji: "🌑", portrait: thriller, category: "narration" },
  { id: "fm-news", name: "FM News Anchor", tagline: "The 8 o'clock voice.",
    description: "Clean, measured, authoritative. Optimized for news bulletins and headlines.",
    voice: "en-US-JennyNeural", rate: 5, pitch: 0,
    sample: "Breaking news. Markets close higher as inflation slows. Full report after the break.",
    emoji: "📻", portrait: fmnews, category: "broadcast" },
  { id: "calm-meditation", name: "Mindful Guide", tagline: "Soft. Present. Grounded.",
    description: "Whispered cadence for meditation, sleep stories, and breathing exercises.",
    voice: "en-US-AvaMultilingualNeural", rate: -25, pitch: -5,
    sample: "Breathe in. Hold. And gently let it go. You are exactly where you need to be.",
    emoji: "🌿", portrait: meditation, category: "wellness" },
  { id: "explainer-yt", name: "YouTube Explainer", tagline: "Friendly, fast, hooked.",
    description: "Energetic and clear. Perfect for educational videos and how-to content.",
    voice: "en-US-AndrewNeural", rate: 12, pitch: 3,
    sample: "Today we're going to break down exactly how this works in three simple steps.",
    emoji: "📺", portrait: yt, category: "creative" },
  { id: "luxury-ad", name: "Luxury Advertiser", tagline: "Velvet and gold.",
    description: "Smooth, confident, premium. The voice of high-end brands and cinematic ads.",
    voice: "en-US-SteffanNeural", rate: -8, pitch: -3,
    sample: "Crafted in Switzerland. Worn by those who never compromise.",
    emoji: "🥃", portrait: luxury, category: "business" },
  { id: "audiobook-romance", name: "Romance Reader", tagline: "Warm, breathy, intimate.",
    description: "Designed for audiobook romance, emotional fiction, and character-driven prose.",
    voice: "en-GB-SoniaNeural", rate: -5, pitch: 2,
    sample: "He took her hand, and the entire room disappeared around them.",
    emoji: "🌹", portrait: romance, category: "narration" },
  { id: "ted-conference", name: "TED Speaker", tagline: "Big ideas, well-paced.",
    description: "Articulate and inspiring. For talks, keynotes, and thought-leadership content.",
    voice: "en-US-EmmaNeural", rate: 0, pitch: 0,
    sample: "What if everything we thought we knew about creativity was completely wrong?",
    emoji: "💡", portrait: ted, category: "business" },
  { id: "nature-doc", name: "Nature Documentary", tagline: "Attenborough-grade.",
    description: "Hushed wonder. Built for nature footage, science explainers, and slow content.",
    voice: "en-GB-RyanNeural", rate: -12, pitch: -2,
    sample: "Here, in the canopy, a single drop of rain becomes a world of its own.",
    emoji: "🦋", portrait: nature, category: "narration" },
  { id: "cartoon", name: "Cartoon Sidekick", tagline: "Big, bouncy, playful.",
    description: "High-energy and expressive. For animation, kids' content, and playful brands.",
    voice: "en-US-AnaNeural", rate: 18, pitch: 15,
    sample: "Whoa! Did you see that?! That was the coolest thing ever!",
    emoji: "🎈", portrait: cartoon, category: "creative" },
  { id: "tech-tutorial", name: "Calm Tutorial", tagline: "Patient. Precise. Pleasant.",
    description: "Even-paced for technical walkthroughs, software demos, and onboarding.",
    voice: "en-US-BrianNeural", rate: -3, pitch: 0,
    sample: "Open the terminal and run npm install. We'll wait for the dependencies to resolve.",
    emoji: "🛠", portrait: tutorial, category: "business" },
  { id: "investor-pitch", name: "Investor Pitch", tagline: "Confident. Focused. Crisp.",
    description: "For founder reels, deck voiceovers, and high-stakes pitch videos.",
    voice: "en-US-EricNeural", rate: 3, pitch: -2,
    sample: "We've built the only platform that combines speed, scale, and simplicity.",
    emoji: "📈", portrait: investor, category: "business" },
  { id: "cinema-trailer", name: "Cinema Trailer", tagline: "In a world…",
    description: "Deep, slow, monumental. Movie trailer voice for promos and intros.",
    voice: "en-US-DavisNeural", rate: -18, pitch: -12,
    sample: "In a world where silence reigned… one voice would change everything.",
    emoji: "🎬", portrait: trailer, category: "creative" },
];

export const PERSONA_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "narration", label: "Narration" },
  { id: "broadcast", label: "Broadcast" },
  { id: "wellness", label: "Wellness" },
  { id: "creative", label: "Creative" },
  { id: "business", label: "Business" },
];
