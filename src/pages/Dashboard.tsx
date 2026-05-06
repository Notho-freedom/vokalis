import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Copy, Check, Trash2, Key, BarChart3, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
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
    if (!confirm("Révoquer définitivement cette clé ?")) return;
    const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Clé révoquée");
    qc.invalidateQueries({ queryKey: ["api_keys"] });
  };

  if (authLoading) return <div className="container py-20 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>;

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-brand mb-2">Dashboard</div>
        <h1 className="font-heading font-bold text-4xl tracking-tight">Bonjour, <span className="text-gradient">{user?.email?.split("@")[0]}</span></h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Usage 30 jours</div>
              <div className="font-heading text-3xl font-bold mt-1">{monthChars.toLocaleString()}<span className="text-base text-muted-foreground"> car.</span></div>
            </div>
            <BarChart3 className="w-5 h-5 text-brand" />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--brand))" />
                  <stop offset="100%" stopColor="hsl(var(--brand-2))" />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="chars" stroke="url(#g)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl border border-border bg-surface">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Quota mensuel</div>
          <div className="font-heading text-3xl font-bold mt-1">{Math.round((monthChars / QUOTA) * 100)}<span className="text-base text-muted-foreground">%</span></div>
          <Progress value={(monthChars / QUOTA) * 100} className="mt-4 h-2" />
          <div className="text-xs text-muted-foreground mt-2">{monthChars.toLocaleString()} / {QUOTA.toLocaleString()} car.</div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">Reset le 1er de chaque mois. Besoin de plus ? Contacte-nous.</p>
        </div>
      </div>

      {/* API KEYS */}
      <div className="rounded-xl border border-border bg-surface mb-8">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-brand" />
            <div>
              <h2 className="font-heading font-semibold text-lg">Clés API</h2>
              <p className="text-xs text-muted-foreground">Utilise ces clés pour authentifier tes requêtes.</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex gap-2">
          <Input placeholder="Nom de la clé (ex: Production)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="bg-background" />
          <Button onClick={createKey} disabled={creating || !newKeyName.trim()} className="bg-gradient-brand text-white hover:opacity-90">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Créer</>}
          </Button>
        </div>
        <div className="border-t border-border">
          {keys.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Aucune clé. Crée ta première clé ci-dessus.</div>}
          {keys.map((k: any) => (
            <div key={k.id} className="p-4 border-b border-border last:border-0 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{k.name}</div>
                <div className="font-mono text-xs text-muted-foreground truncate">{k.key_prefix}{"•".repeat(20)}</div>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {k.last_used_at ? `Utilisée le ${new Date(k.last_used_at).toLocaleDateString()}` : "Jamais utilisée"}
              </div>
              {k.revoked_at ? (
                <span className="text-xs font-mono px-2 py-1 rounded bg-destructive/10 text-destructive">Révoquée</span>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => revoke(k.id)}><Trash2 className="w-4 h-4" /></Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RECENT REQUESTS */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="p-6 border-b border-border">
          <h2 className="font-heading font-semibold text-lg">Requêtes récentes</h2>
        </div>
        {usage.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune requête encore.</div>
        ) : (
          <div className="divide-y divide-border">
            {usage.slice(0, 20).map((u: any, i: number) => (
              <div key={i} className="p-3 px-6 flex items-center gap-4 text-sm">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${u.status < 400 ? "bg-brand-2/10 text-brand-2" : "bg-destructive/10 text-destructive"}`}>{u.status}</span>
                <span className="font-mono text-xs">{u.endpoint}</span>
                <span className="text-xs text-muted-foreground truncate flex-1">{u.voice || "—"}</span>
                <span className="text-xs text-muted-foreground">{u.characters} car.</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{new Date(u.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New key dialog */}
      <Dialog open={!!revealedKey} onOpenChange={(o) => !o && setRevealedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta nouvelle clé API</DialogTitle>
            <DialogDescription>
              <AlertCircle className="w-4 h-4 inline mr-1 text-brand" />
              Copie-la maintenant — elle ne sera plus jamais affichée.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-surface-2 p-4 font-mono text-sm break-all">{revealedKey}</div>
          <Button onClick={() => { navigator.clipboard.writeText(revealedKey!); setCopied(true); toast.success("Copiée"); }} className="bg-gradient-brand text-white">
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? "Copiée" : "Copier la clé"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
