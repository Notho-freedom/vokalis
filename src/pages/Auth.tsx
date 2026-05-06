import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        toast.success("Compte créé ! Vérifie ton email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté");
        navigate("/dashboard");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl">Vocalis</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-card">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-0">
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 bg-background h-11" placeholder="vous@exemple.com" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Mot de passe</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 bg-background h-11" placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-brand text-white hover:opacity-90 shadow-glow">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === "signup" ? "Créer un compte" : "Se connecter"}
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-6">
                {tab === "signup" ? "Déjà un compte ?" : "Pas de compte ?"}{" "}
                <button onClick={() => setTab(tab === "signup" ? "login" : "signup")} className="text-brand hover:underline">
                  {tab === "signup" ? "Connexion" : "Inscription"}
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          En continuant, tu acceptes nos conditions d'utilisation.
        </p>
      </motion.div>
    </div>
  );
}
