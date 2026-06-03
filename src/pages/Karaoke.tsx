import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Play, Pause, Sparkles } from "lucide-react";
import { synthesize, fetchCaptions, fetchCaptionFile, type CaptionWord } from "@/lib/tts";
import { LiveWaveform } from "@/components/motion/LiveWaveform";
import { VoicePicker } from "@/components/VoicePicker";
import { toast } from "sonner";

const DEFAULT_TEXT = `In a world of noise, your words can finally have a voice. Paste any passage, choose a voice, and watch each word light up in perfect sync with the audio.`;

export default function Karaoke() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voice, setVoice] = useState("en-US-AvaMultilingualNeural");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [words, setWords] = useState<CaptionWord[]>([]);
  const [currentMs, setCurrentMs] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const a = audioRef.current;
    const update = () => setCurrentMs(Math.round(a.currentTime * 1000));
    a.addEventListener("timeupdate", update);
    a.addEventListener("play", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));
    a.addEventListener("ended", () => setPlaying(false));
    return () => a.removeEventListener("timeupdate", update);
  }, []);

  const activeIdx = useMemo(() => {
    if (!words.length) return -1;
    let idx = -1;
    for (let i = 0; i < words.length; i++) {
      if (words[i].offset_ms <= currentMs) idx = i; else break;
    }
    return idx;
  }, [words, currentMs]);

  const generate = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const [{ blob }, captions] = await Promise.all([
        synthesize(text, voice),
        fetchCaptions(text, voice, 6).catch(() => ({ cues: [], words: [] })),
      ]);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      audioRef.current.src = url;
      audioRef.current.crossOrigin = "anonymous";
      setWords(captions.words || []);
      await audioRef.current.play();
    } catch (e: any) {
      toast.error("Karaoke generation failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => {
    if (!audioUrl) return generate();
    if (playing) audioRef.current.pause(); else audioRef.current.play();
  };

  const downloadSrt = async () => {
    try {
      const srt = await fetchCaptionFile(text, voice, "srt");
      const blob = new Blob([srt], { type: "application/x-subrip" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u; a.download = "vocalis-captions.srt"; a.click();
      URL.revokeObjectURL(u);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 pt-16 pb-32">
      <div className="section-num mb-3">Karaoke</div>
      <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-4">Read along.</h1>
      <p className="font-prose text-muted-foreground max-w-xl mb-12">
        Word-level highlighting synchronized with the synthesized audio. Export SRT/VTT captions
        for video editors, accessibility, or just because it looks great.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-px bg-border">
        <div className="bg-background p-8">
          {words.length === 0 ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent outline-none resize-none font-display text-2xl md:text-3xl leading-snug min-h-[300px]"
              maxLength={5000}
            />
          ) : (
            <div className="font-display text-2xl md:text-4xl leading-relaxed">
              {words.map((w, i) => {
                const active = i === activeIdx;
                const past = i < activeIdx;
                return (
                  <span
                    key={i}
                    className={`transition-colors duration-150 ${
                      active ? "text-signal" : past ? "text-foreground" : "text-muted-foreground/40"
                    }`}
                    style={{
                      filter: active ? "drop-shadow(0 0 14px hsl(var(--signal) / 0.6))" : "none",
                      transform: active ? "scale(1.03)" : "scale(1)",
                      display: "inline-block",
                      transition: "transform 120ms ease",
                    }}
                  >
                    {w.text}&nbsp;
                  </span>
                );
              })}
            </div>
          )}
          <div className="mt-6">
            <LiveWaveform audio={audioRef.current} height={64} />
          </div>
        </div>

        <div className="bg-card p-6 flex flex-col gap-4">
          <div>
            <VoicePicker value={voice} onChange={setVoice} text={text} compact />
          </div>
          <button
            onClick={toggle}
            disabled={busy || !text.trim()}
            className="px-4 py-3 bg-signal text-accent-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2 glow-signal"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {busy ? "Synthesizing…" : audioUrl ? (playing ? "Pause" : "Play") : "Generate karaoke"}
          </button>
          {audioUrl && (
            <>
              <button
                onClick={downloadSrt}
                className="px-4 py-2.5 border hairline rounded-md text-sm hover:bg-background transition inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download SRT
              </button>
              <button
                onClick={() => { setAudioUrl(null); setWords([]); audioRef.current.src = ""; }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Edit text
              </button>
            </>
          )}
          <div className="mt-auto text-[11px] text-muted-foreground border-t hairline pt-4 leading-relaxed">
            <Sparkles className="w-3 h-3 inline mr-1 text-signal" />
            Powered by Azure Neural word-boundary events. Sub-50ms timing accuracy.
          </div>
        </div>
      </div>
    </div>
  );
}
