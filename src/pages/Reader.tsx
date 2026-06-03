import { useState, useRef } from "react";
import { Link2, Upload, Play, Pause, Loader2, FileText } from "lucide-react";
import { synthesize, detectLanguage, langName } from "@/lib/tts";
import { VoicePicker } from "@/components/VoicePicker";
import { toast } from "sonner";

type Chapter = { title: string; text: string; audioUrl?: string };

export default function Reader() {
  const [url, setUrl] = useState("");
  const [voice, setVoice] = useState("en-US-AvaMultilingualNeural");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const resetAudio = () => {
    audioRef.current.pause();
    setPlaying(false);
    setChapters((c) => c.map((x) => ({ ...x, audioUrl: undefined })));
  };

  const onVoiceChange = (v: string) => {
    if (v !== voice) resetAudio();
    setVoice(v);
  };

  const autoDetect = async (text: string) => {
    try {
      const r = await detectLanguage(text.slice(0, 2000));
      if (r?.lang) setDetectedLang(r.lang);
    } catch { /* noop */ }
  };

  const splitToChapters = (text: string): Chapter[] => {
    // naive: split by double newlines or every ~1500 chars
    const paras = text.split(/\n\s*\n/).filter((p) => p.trim().length > 50);
    if (paras.length <= 1) {
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += 1500) chunks.push(text.slice(i, i + 1500));
      return chunks.map((t, i) => ({ title: `Section ${i + 1}`, text: t.trim() }));
    }
    return paras.slice(0, 30).map((t, i) => ({
      title: t.split("\n")[0].slice(0, 60) || `Chapter ${i + 1}`,
      text: t.trim(),
    }));
  };

  const fetchUrl = async () => {
    if (!url) return;
    setLoading(true);
    try {
      // Use a CORS-friendly extractor via Jina AI (free)
      const r = await fetch(`https://r.jina.ai/${url}`);
      const text = await r.text();
      setChapters(splitToChapters(text));
      toast.success("Article extracted");
    } catch (e: any) {
      toast.error("Extraction failed", { description: e.message });
    } finally { setLoading(false); }
  };

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Lazy import pdfjs only when needed
      const pdfUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs";
      const pdfjs: any = await import(/* @vite-ignore */ pdfUrl);
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs";
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      let full = "";
      for (let i = 1; i <= Math.min(doc.numPages, 50); i++) {
        const page = await doc.getPage(i);
        const tc = await page.getTextContent();
        full += tc.items.map((it: any) => it.str).join(" ") + "\n\n";
      }
      setChapters(splitToChapters(full));
      toast.success(`Loaded ${doc.numPages} pages`);
    } catch (e: any) {
      toast.error("PDF failed", { description: e.message });
    } finally { setLoading(false); }
  };

  const generateChapter = async (idx: number) => {
    setGenerating(idx);
    try {
      const ch = chapters[idx];
      const { blob } = await synthesize(ch.text.slice(0, 4900), voice);
      const audioUrl = URL.createObjectURL(blob);
      setChapters((c) => c.map((x, i) => (i === idx ? { ...x, audioUrl } : x)));
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        if (idx + 1 < chapters.length) {
          setCurrent(idx + 1);
          if (chapters[idx + 1].audioUrl) audioRef.current.src = chapters[idx + 1].audioUrl!;
          else generateChapter(idx + 1);
        } else setPlaying(false);
      };
      await audioRef.current.play();
      setPlaying(true);
      setCurrent(idx);
    } catch (e: any) {
      toast.error("Generation failed", { description: e.message });
    } finally { setGenerating(null); }
  };

  const playChapter = async (idx: number) => {
    if (chapters[idx].audioUrl) {
      audioRef.current.src = chapters[idx].audioUrl!;
      await audioRef.current.play();
      setPlaying(true);
      setCurrent(idx);
    } else {
      await generateChapter(idx);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 pt-12 pb-32">
      <div className="section-num mb-3">Article Reader</div>
      <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-8">Anything to <span className="italic text-signal">audio</span>.</h1>

      {chapters.length === 0 && (
        <div className="grid md:grid-cols-2 gap-px bg-border">
          <div className="bg-background p-8">
            <Link2 className="w-5 h-5 text-signal mb-4" />
            <h3 className="font-display text-2xl mb-2">From a URL</h3>
            <p className="text-sm text-muted-foreground mb-4">Paste any article, blog post or page.</p>
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="flex-1 bg-card border hairline rounded-md px-3 py-2 text-sm" />
              <button onClick={fetchUrl} disabled={loading} className="px-4 py-2 bg-signal text-accent-foreground rounded-md text-sm font-medium disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extract"}
              </button>
            </div>
          </div>
          <div className="bg-background p-8">
            <Upload className="w-5 h-5 text-signal mb-4" />
            <h3 className="font-display text-2xl mb-2">From a PDF</h3>
            <p className="text-sm text-muted-foreground mb-4">Drop a file (up to 50 pages).</p>
            <label className="block border-2 border-dashed hairline rounded-md p-6 text-center cursor-pointer hover:border-signal transition">
              <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload PDF</span>
              <input type="file" accept="application/pdf" onChange={handlePdf} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {chapters.length > 0 && (
        <div className="space-y-1 border hairline rounded-lg overflow-hidden">
          {chapters.map((ch, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 transition ${current === i ? "bg-signal/10 border-l-2 border-signal" : "bg-card/30 hover:bg-card/60"}`}>
              <button
                onClick={() => playChapter(i)}
                disabled={generating !== null}
                className="w-10 h-10 rounded-full bg-signal text-accent-foreground flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {generating === i ? <Loader2 className="w-4 h-4 animate-spin" /> : current === i && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-muted-foreground">Chapter {String(i + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{ch.text.length} chars</span>
                </div>
                <h4 className="font-display text-lg truncate mb-1">{ch.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{ch.text.slice(0, 200)}…</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {chapters.length > 0 && (
        <button onClick={() => { setChapters([]); setUrl(""); audioRef.current.pause(); }} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
          ← Load something else
        </button>
      )}
    </div>
  );
}
