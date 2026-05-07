import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Copy, Check, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const QUOTA = 50_000;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  const { data: keys = [] } = useQuery({
    queryKey: ["api_keys", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: usage = [] } = useQuery({
    queryKey: ["usage", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data, error } = await supabase.from("api_usage")
        .select("characters, created_at, voice, endpoint, status")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const monthChars = (() => {
    const start = new Date(); start.setUTCDate(1); start.setUTCHours(0,0,0,0);
    return usage.filter((u: any) => new Date(u.created_at) >= start).reduce((s: number, u: any) => s + (u.characters || 0), 0);
  })();

  const totalReqs = usage.length;

  const chartData = (() => {
    const buckets: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    usage.forEach((u: any) => {
      const k = new Date(u.created_at).toISOString().slice(0, 10);
      if (k in buckets) buckets[k] += u.characters || 0;
    });
    return Object.entries(buckets).map(([date, chars]) => ({ date: date.slice(5), chars }));
  })();

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-api-key", { body: { name: newKeyName } });
      if (error) throw error;
      setRevealedKey(data.key);
      setNewKeyName("");
      qc.invalidateQueries({ queryKey: ["api_keys"] });
    } catch (e: any) { toast.error(e.message); } finally { setCreating(false); }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this key permanently?")) return;
    const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Key revoked");
    qc.invalidateQueries({ queryKey: ["api_keys"] });
  };

  if (authLoading) return <div className="container py-20 text-center"><Loader2 className="w-4 h-4 animate-spin inline" /></div>;

  const quotaPct = Math.min(100, (monthChars / QUOTA) * 100);

  return (
    <div>
      {/* HEADER */}
      <div className="border-b hairline">
        <div className="container py-8">
          <div className="mono-label text-muted-foreground mb-3">/ dashboard · console</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight">
            <span className="italic">Hello,</span> {user?.email?.split("@")[0]}.
          </h1>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="border-b hairline">
        <div className="container grid grid-cols-2 md:grid-cols-4 divide-x hairline">
          {[
            { l: "month chars", v: monthChars.toLocaleString() },
            { l: "requests 30d", v: totalReqs.toLocaleString() },
            { l: "quota used", v: `${quotaPct.toFixed(1)}%` },
            { l: "active keys", v: keys.filter((k: any) => !k.revoked_at).length },
          ].map((m) => (
            <div key={m.l} className="p-6">
              <div className="mono-label text-muted-foreground">{m.l}</div>
              <div className="font-serif text-4xl mt-2 tabular-nums">{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container py-10 grid lg:grid-cols-3 gap-10">
        {/* QUOTA + CHART */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <div className="mono-label text-muted-foreground">// usage · last 30 days</div>
              <div className="font-mono text-xs text-muted-foreground tabular-nums">{monthChars.toLocaleString()} / {QUOTA.toLocaleString()} chars</div>
            </div>
            <div className="border hairline">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 0, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <Line type="monotone" dataKey="chars" stroke="hsl(var(--signal))" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QUOTA BAR */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <div className="mono-label text-muted-foreground">// monthly quota</div>
              <div className="font-mono text-xs">{quotaPct.toFixed(1)}%</div>
            </div>
            <div className="h-1 bg-border w-full overflow-hidden">
              <div className="h-full bg-signal transition-all" style={{ width: `${quotaPct}%` }} />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-wider">resets 1st of each month</p>
          </div>

          {/* RECENT REQUESTS */}
          <div>
            <div className="mono-label text-muted-foreground mb-3">// recent requests</div>
            <div className="border hairline">
              <div className="grid grid-cols-[60px_80px_1fr_80px_140px] gap-2 px-3 py-2 mono-label text-muted-foreground bg-surface border-b hairline">
                <span>status</span>
                <span>endpoint</span>
                <span>voice</span>
                <span className="text-right">chars</span>
                <span className="text-right">time</span>
              </div>
              {usage.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-muted-foreground">no requests yet — try the playground</div>
              ) : (
                <div className="divide-y hairline">
                  {usage.slice(0, 30).map((u: any, i: number) => (
                    <div key={i} className="grid grid-cols-[60px_80px_1fr_80px_140px] gap-2 px-3 py-2 text-xs font-mono items-center">
                      <span className={u.status < 400 ? "text-signal" : "text-destructive"}>{u.status}</span>
                      <span className="text-muted-foreground truncate">{u.endpoint}</span>
                      <span className="text-muted-foreground truncate">{u.voice || "—"}</span>
                      <span className="text-right tabular-nums">{u.characters}</span>
                      <span className="text-right text-muted-foreground tabular-nums">{new Date(u.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API KEYS */}
        <aside>
          <div className="mono-label text-muted-foreground mb-3">// api keys</div>
          <div className="border hairline">
            <div className="p-3 border-b hairline flex gap-2">
              <input
                value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="key name (e.g. production)"
                className="flex-1 bg-background border hairline px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-signal"
              />
              <button
                onClick={createKey} disabled={creating || !newKeyName.trim()}
                className="px-3 py-1.5 text-xs font-mono bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition disabled:opacity-40 inline-flex items-center gap-1"
              >
                {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                new
              </button>
            </div>
            <div>
              {keys.length === 0 && <div className="p-6 text-center text-xs font-mono text-muted-foreground">no keys yet</div>}
              {keys.map((k: any) => (
                <div key={k.id} className="p-3 border-b hairline last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-medium">{k.name}</span>
                    {k.revoked_at ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">revoked</span>
                    ) : (
                      <button onClick={() => revoke(k.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{k.key_prefix}{"•".repeat(20)}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-1">
                    {k.last_used_at ? `last used · ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* New key dialog */}
      <Dialog open={!!revealedKey} onOpenChange={(o) => !o && setRevealedKey(null)}>
        <DialogContent className="border hairline rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Your new key.</DialogTitle>
            <DialogDescription className="font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-signal" />
              Copy it now — it will never be displayed again.
            </DialogDescription>
          </DialogHeader>
          <div className="border hairline bg-surface p-4 font-mono text-xs break-all">{revealedKey}</div>
          <button
            onClick={() => { navigator.clipboard.writeText(revealedKey!); setCopied(true); toast.success("Copied"); }}
            className="px-4 py-2 text-xs font-mono bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition inline-flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "copied" : "copy key"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
