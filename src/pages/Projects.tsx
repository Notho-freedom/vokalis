import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Trash2, Globe, Lock, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Project = { id: string; title: string; text: string; voice: string | null; is_public: boolean; slug: string | null; created_at: string };

export default function Projects() {
  const { user } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const togglePublic = async (p: Project) => {
    const slug = p.slug || crypto.randomUUID().slice(0, 8);
    const { error } = await supabase.from("projects").update({ is_public: !p.is_public, slug }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(!p.is_public ? `Public: /share/${slug}` : "Made private");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  if (!user) return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl mb-4">Sign in to view your projects.</h1>
      <Link to="/auth" className="text-signal hover:underline">Sign in →</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 pt-12 pb-32">
      <div className="section-num mb-3">Library</div>
      <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-10">Your projects.</h1>

      {loading ? <div className="text-muted-foreground text-sm">Loading…</div> : items.length === 0 ? (
        <div className="text-center py-24 border hairline rounded-lg">
          <p className="text-muted-foreground mb-4">No projects yet.</p>
          <Link to="/playground" className="text-signal hover:underline">Open the Playground →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.id} className="border hairline rounded-lg p-5 bg-card/30 hover:bg-card/60 transition flex items-start gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  {p.voice && <span className="font-mono text-[11px] text-muted-foreground">· {p.voice}</span>}
                  {p.is_public && p.slug && (
                    <Link to={`/share/${p.slug}`} className="ml-auto text-[11px] font-mono text-signal hover:underline inline-flex items-center gap-1">
                      /share/{p.slug} <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <h3 className="font-display text-xl mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.text}</p>
              </div>
              <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => togglePublic(p)} className="p-2 hover:bg-background rounded-md" title={p.is_public ? "Make private" : "Share publicly"}>
                  {p.is_public ? <Globe className="w-4 h-4 text-signal" /> : <Lock className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/10 rounded-md">
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
