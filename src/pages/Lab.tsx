import { useState, useRef } from "react";
import { Plus, Trash2, Play, Loader2, Download, GripVertical } from "lucide-react";
import { synthesize } from "@/lib/tts";
import { PERSONAS } from "@/data/personas";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Segment = { id: string; speaker: string; text: string; voice: string; color: string };

const SPEAKER_COLORS = ["#FFB627", "#7DD3FC", "#F472B6", "#A78BFA", "#34D399", "#FB923C"];
const VOICES_QUICK = [
  { name: "Aria", v: "en-US-AvaMultilingualNeural" },
  { name: "Guy", v: "en-US-GuyNeural" },
  { name: "Jenny", v: "en-US-JennyNeural" },
  { name: "Andrew", v: "en-US-AndrewNeural" },
  { name: "Sonia", v: "en-GB-SoniaNeural" },
  { name: "Davis", v: "en-US-DavisNeural" },
];

export default function Lab() {
  const { user } = useAuth();
  const [name, setName] = useState("New session");
  const [segments, setSegments] = useState<Segment[]>([
    { id: crypto.randomUUID(), speaker: "Anna", text: "Hi, welcome to our podcast.", voice: "en-US-AvaMultilingualNeural", color: SPEAKER_COLORS[0] },
    { id: crypto.randomUUID(), speaker: "Mark", text: "Thanks for having me — I've been looking forward to this.", voice: "en-US-GuyNeural", color: SPEAKER_COLORS[1] },
  ]);
  const [busy, setBusy] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const addSegment = () => {
    setSegments((s) => [
      ...s,
      { id: crypto.randomUUID(), speaker: `Speaker ${s.length + 1}`, text: "", voice: VOICES_QUICK[s.length % VOICES_QUICK.length].v, color: SPEAKER_COLORS[s.length % SPEAKER_COLORS.length] },
    ]);
  };

  const update = (id: string, patch: Partial<Segment>) => setSegments((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) => setSegments((s) => s.filter((x) => x.id !== id));

  // Concatenate WAV by playing sequentially via Web Audio
  const generate = async () => {
    setBusy(true);
    try {
      const ctx = new AudioContext();
      const buffers: AudioBuffer[] = [];
      for (const seg of segments) {
        if (!seg.text.trim()) continue;
        const { blob } = await synthesize(seg.text, seg.voice);
        const ab = await blob.arrayBuffer();
        const buf = await ctx.decodeAudioData(ab);
        buffers.push(buf);
      }
      if (!buffers.length) throw new Error("No content");
      const sampleRate = buffers[0].sampleRate;
      const totalLen = buffers.reduce((sum, b) => sum + b.length, 0);
      const merged = ctx.createBuffer(1, totalLen, sampleRate);
      let offset = 0;
      for (const buf of buffers) {
        merged.getChannelData(0).set(buf.getChannelData(0), offset);
        offset += buf.length;
      }
      const wav = audioBufferToWav(merged);
      const blob = new Blob([wav], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      audioRef.current.src = url;
      await audioRef.current.play();
      toast.success("Mix ready");
    } catch (e: any) {
      toast.error("Mix failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!user) return toast.error("Sign in first");
    const { error } = await supabase.from("lab_projects").upsert({
      user_id: user.id, name, segments: segments as any
    });
    error ? toast.error(error.message) : toast.success("Lab project saved");
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 pt-12 pb-32">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="section-num mb-3">Voice Lab</div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">Multi-voice studio.</h1>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent border-b hairline text-lg px-1 py-1 outline-none focus:border-signal"
        />
      </div>

      <p className="font-prose text-muted-foreground mb-8 max-w-2xl">
        Build dialogues, podcasts, audiobooks. Add speakers, assign voices, write lines. Generate one mixed audio file.
      </p>

      <div className="space-y-3 mb-8">
        {segments.map((s, i) => (
          <div key={s.id} className="border hairline rounded-lg p-4 bg-card/50 group">
            <div className="flex items-center gap-3 mb-3">
              <GripVertical className="w-4 h-4 text-muted-foreground opacity-50" />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <input
                value={s.speaker}
                onChange={(e) => update(s.id, { speaker: e.target.value })}
                className="bg-transparent border-b hairline text-sm font-medium px-1 py-0.5 outline-none focus:border-signal w-32"
              />
              <select
                value={s.voice}
                onChange={(e) => update(s.id, { voice: e.target.value })}
                className="bg-background border hairline rounded px-2 py-1 text-xs font-mono ml-auto"
              >
                {VOICES_QUICK.map((v) => <option key={v.v} value={v.v}>{v.name} · {v.v.split("-").slice(0, 2).join("-")}</option>)}
              </select>
              <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive p-1.5">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={s.text}
              onChange={(e) => update(s.id, { text: e.target.value })}
              placeholder="Speaker line…"
              className="w-full bg-transparent border-none outline-none resize-none text-base font-display leading-relaxed min-h-[60px]"
            />
          </div>
        ))}
      </div>

      <button onClick={addSegment} className="w-full border-2 border-dashed hairline rounded-lg py-4 text-sm text-muted-foreground hover:border-signal hover:text-signal transition mb-8 inline-flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add speaker line
      </button>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t hairline bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1100px] px-6 py-4 flex items-center gap-4">
          <button
            onClick={generate}
            disabled={busy}
            className="px-5 py-2.5 bg-signal text-accent-foreground rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 transition inline-flex items-center gap-2 glow-signal"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {busy ? `Mixing ${segments.length} voices…` : "Generate mix"}
          </button>
          <span className="text-xs text-muted-foreground">{segments.length} segments · {segments.reduce((s, x) => s + x.text.length, 0)} chars</span>
          <div className="ml-auto flex gap-2">
            <button onClick={save} className="px-3 py-2 border hairline rounded-md text-xs hover:bg-secondary transition">Save project</button>
            {audioUrl && (
              <a href={audioUrl} download="lab-mix.wav" className="px-3 py-2 border hairline rounded-md text-xs hover:bg-secondary transition inline-flex items-center gap-2">
                <Download className="w-3.5 h-3.5" /> WAV
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal WAV encoder for AudioBuffer (mono)
function audioBufferToWav(buf: AudioBuffer): ArrayBuffer {
  const numCh = 1;
  const sampleRate = buf.sampleRate;
  const samples = buf.getChannelData(0);
  const byteRate = sampleRate * numCh * 2;
  const blockAlign = numCh * 2;
  const dataSize = samples.length * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  let p = 0;
  const wstr = (s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(p++, s.charCodeAt(i)); };
  wstr("RIFF"); view.setUint32(p, 36 + dataSize, true); p += 4;
  wstr("WAVE"); wstr("fmt "); view.setUint32(p, 16, true); p += 4;
  view.setUint16(p, 1, true); p += 2; view.setUint16(p, numCh, true); p += 2;
  view.setUint32(p, sampleRate, true); p += 4; view.setUint32(p, byteRate, true); p += 4;
  view.setUint16(p, blockAlign, true); p += 2; view.setUint16(p, 16, true); p += 2;
  wstr("data"); view.setUint32(p, dataSize, true); p += 4;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7FFF, true); p += 2;
  }
  return ab;
}
