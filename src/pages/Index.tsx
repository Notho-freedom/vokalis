import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Globe, Zap, Code2, Mic2, Languages, Infinity as InfIcon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  { icon: Mic2, title: "400+ voix neuronales", desc: "Voix réalistes et naturelles, hommes & femmes, dans toutes les langues majeures." },
  { icon: Languages, title: "100+ langues", desc: "Du français au mandarin en passant par le swahili. Détection automatique." },
  { icon: Zap, title: "API REST simple", desc: "Une requête POST, un MP3 en sortie. Latence sub-seconde." },
  { icon: InfIcon, title: "Gratuit & illimité*", desc: "Pas de carte bancaire. Quota mensuel généreux pour les développeurs." },
];

const SAMPLE = `curl -X POST https://api.vocalis.dev/tts \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Bonjour, bienvenue sur Vocalis.",
    "voice": "fr-FR-DeniseNeural"
  }' --output speech.mp3`;

export default function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative pt-20 pb-24 md:pt-32 md:pb-32 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/80 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-2 animate-pulse" />
            v1.0 · Open beta
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight max-w-5xl mx-auto">
            Synthèse vocale,<br />
            <span className="text-gradient">gratuite et sans limite.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {APP_NAME} transforme du texte en voix humaine via une API REST minimaliste. 400+ voix, 100+ langues, zéro friction.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90 shadow-glow h-12 px-6">
              <Link to="/playground">Essayer le playground <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/docs"><Code2 className="w-4 h-4 mr-1.5" />Documentation API</Link>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-16 max-w-2xl mx-auto text-left">
            <CodeBlock code={SAMPLE} language="bash" />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/50 bg-surface/40">
        <div className="container py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "400+", l: "Voix neuronales" },
            { v: "100+", l: "Langues" },
            { v: "<800ms", l: "Latence moyenne" },
            { v: "99.9%", l: "Uptime" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-heading font-bold text-3xl md:text-4xl text-gradient">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-24">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-brand mb-3">Features</div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl tracking-tight">Conçu pour les développeurs.<br /><span className="text-muted-foreground">Pensé pour les humains.</span></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="p-6 rounded-xl border border-border bg-surface hover:border-brand/40 transition group">
              <div className="w-10 h-10 rounded-lg bg-gradient-brand/10 border border-brand/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition">
                <f.icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="container py-12 pb-24">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2 p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-brand opacity-10 blur-3xl rounded-full" />
          <div className="relative max-w-2xl">
            <Sparkles className="w-8 h-8 text-brand mb-4" />
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight mb-4">Donnez une voix à tout.</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Audiobooks, IVR, assistants vocaux, accessibilité, e-learning, podcasts auto-générés, voix off pour vidéos.
              Si ça parle, {APP_NAME} le fait — gratuitement.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Audiobooks", "IVR / Téléphonie", "E-learning", "Accessibilité", "Voice agents", "Podcasts IA", "Voix off"].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full text-xs font-mono border border-border bg-background/50">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24 text-center">
        <Globe className="w-12 h-12 mx-auto text-brand mb-6 animate-float" />
        <h2 className="font-heading font-bold text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto">
          Prêt à donner une voix à votre prochaine idée ?
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Aucune carte bancaire. Aucun engagement. Juste du code et du son.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90 shadow-glow h-12 px-6">
            <Link to="/auth?mode=signup">Créer un compte gratuit</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6">
            <a href="https://github.com" target="_blank" rel="noreferrer"><Github className="w-4 h-4 mr-1.5" />Star sur GitHub</a>
          </Button>
        </div>
      </section>
    </>
  );
}
