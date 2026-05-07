import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate("/dashboard");
      }
    } catch (e: any) {
      toast.error(e.message || "Error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] grid lg:grid-cols-2">
      {/* LEFT — editorial side */}
      <div className="hidden lg:flex flex-col justify-between border-r hairline p-12 bg-surface">
        <div className="mono-label text-muted-foreground flex items-center gap-3">
          <span className="signal-dot" />
          <span>vocalis · access</span>
        </div>
        <div>
          <blockquote className="font-serif text-5xl xl:text-6xl leading-[1.05] tracking-tight">
            "The voice is <span className="italic">the most musical</span> instrument we own — and the most overlooked."
          </blockquote>
          <div className="mono-label text-muted-foreground mt-8">— oliver sacks</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs font-mono text-muted-foreground">
          <div>
            <div className="mono-label mb-1">voices</div>
            <div className="text-foreground tabular-nums">412</div>
          </div>
          <div>
            <div className="mono-label mb-1">languages</div>
            <div className="text-foreground tabular-nums">104</div>
          </div>
          <div>
            <div className="mono-label mb-1">price</div>
            <div className="text-foreground">free</div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mono-label text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-12">
            ← back home
          </Link>

          <div className="flex gap-1 mono-label mb-8">
            <button onClick={() => setTab("login")} className={tab === "login" ? "text-foreground underline underline-offset-4 decoration-signal decoration-2" : "text-muted-foreground"}>
              sign in
            </button>
            <span className="text-muted-foreground">/</span>
            <button onClick={() => setTab("signup")} className={tab === "signup" ? "text-foreground underline underline-offset-4 decoration-signal decoration-2" : "text-muted-foreground"}>
              create account
            </button>
          </div>

          <h1 className="font-serif text-5xl tracking-tight mb-2">
            {tab === "signup" ? <>Begin.</> : <><span className="italic">Welcome</span> back.</>}
          </h1>
          <p className="font-mono text-xs text-muted-foreground mb-8">
            {tab === "signup" ? "no card · 50 000 chars / month free" : "you've been missed."}
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="mono-label text-muted-foreground block mb-2">email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full bg-transparent border-b hairline py-2 font-mono text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="mono-label text-muted-foreground block mb-2">password</label>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b hairline py-2 font-mono text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
              {tab === "signup" ? "create account" : "sign in"}
            </button>
          </form>

          <p className="text-xs font-mono text-muted-foreground mt-12 leading-relaxed">
            By continuing you accept our terms. We never sell data and store only what's needed to make the API work for you.
          </p>
        </div>
      </div>
    </div>
  );
}
