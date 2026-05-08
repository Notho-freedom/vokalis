import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Pause, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { synthesize } from "@/lib/tts";
import { APP_NAME } from "@/lib/constants";

export default function Share() {
  const { slug } = useParams();
  const [project, setProject] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    if (!slug) return;
    supabase.from("projects").select("*").eq("slug", slug).eq("is_public", true).maybeSingle()
      .then(({ data }) => setProject(data));
  }, [slug]);

  const play = async () => {
    if (audioUrl) {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else { audioRef.current.play(); setPlaying(true); }
      return;
    }
    setBusy(true);
    try {
      const { blob } = await synthesize(project.text, project.voice || "en-US-AvaMultilingualNeural");
      const u = URL.createObjectURL(blob);
      setAudioUrl(u);
      audioRef.current.src = u;
      audioRef.current.onended = () => setPlaying(false);
      await audioRef.current.play();
      setPlaying(true);
    } finally { setBusy(false); }
  };

  if (!project) return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl mb-4">Project not found</h1>
      <Link to="/" className="text-signal hover:underline">Go home →</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-32">
      <div className="section-num mb-4">Shared via {APP_NAME}</div>
      <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-8">{project.title}</h1>
      <div className="border hairline rounded-xl p-8 bg-card/40 mb-8">
        <p className="font-display text-xl md:text-2xl leading-relaxed text-foreground/90 mb-8">"{project.text}"</p>
        <button
          onClick={play}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal text-accent-foreground rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 transition"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {busy ? "Synthesizing…" : playing ? "Pause" : "Listen"}
        </button>
      </div>
      <div className="text-center text-xs font-mono text-muted-foreground">
        <Link to="/" className="hover:text-foreground">↳ Make your own at vocalis.app</Link>
      </div>
    </div>
  );
}
