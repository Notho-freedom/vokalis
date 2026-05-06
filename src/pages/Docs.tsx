import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROXY_URL, APP_NAME } from "@/lib/constants";
import { Key, Zap, ListMusic, Languages, AudioLines, CheckCircle2 } from "lucide-react";

const sections = [
  { id: "quickstart", label: "Quickstart", icon: Zap },
  { id: "auth", label: "Authentification", icon: Key },
  { id: "tts", label: "POST /tts", icon: AudioLines },
  { id: "voices", label: "GET /voices", icon: ListMusic },
  { id: "voices-by-language", label: "GET /voices-by-language", icon: Languages },
  { id: "voices-by-text", label: "POST /voices-by-text", icon: Languages },
  { id: "errors", label: "Erreurs", icon: CheckCircle2 },
];

const samples = {
  curl: `curl -X POST ${PROXY_URL}/tts \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Bonjour le monde","voice":"fr-FR-DeniseNeural"}' \\
  --output speech.mp3`,
  js: `const res = await fetch("${PROXY_URL}/tts", {
  method: "POST",
  headers: {
    "x-api-key": "vk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "Bonjour le monde",
    voice: "fr-FR-DeniseNeural",
  }),
});

const blob = await res.blob();
const audio = new Audio(URL.createObjectURL(blob));
audio.play();`,
  python: `import requests

r = requests.post(
    "${PROXY_URL}/tts",
    headers={"x-api-key": "vk_live_..."},
    json={"text": "Bonjour le monde", "voice": "fr-FR-DeniseNeural"},
)

with open("speech.mp3", "wb") as f:
    f.write(r.content)`,
  node: `import fs from "node:fs";

const r = await fetch("${PROXY_URL}/tts", {
  method: "POST",
  headers: { "x-api-key": "vk_live_...", "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Bonjour le monde", voice: "fr-FR-DeniseNeural" }),
});
const buf = Buffer.from(await r.arrayBuffer());
fs.writeFileSync("speech.mp3", buf);`,
};

function Section({ id, title, children }: any) {
  return (
    <section id={id} className="scroll-mt-24 py-8 border-b border-border last:border-0">
      <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight mb-4">{title}</h2>
      <div className="prose prose-sm dark:prose-invert max-w-none">{children}</div>
    </section>
  );
}

export default function Docs() {
  const [tab, setTab] = useState("curl");

  return (
    <div className="container py-10 md:py-14">
      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Documentation</div>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition">
                  <s.icon className="w-3.5 h-3.5" />{s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-brand mb-2">API Reference v1</div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl tracking-tight">{APP_NAME} API</h1>
          <p className="text-muted-foreground mt-3 text-lg">Une API REST minimaliste pour transformer du texte en voix humaine. Authentifie tes requêtes avec une clé API.</p>

          <div className="mt-6 p-4 rounded-lg border border-border bg-surface">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Base URL</div>
            <div className="font-mono text-sm break-all">{PROXY_URL}</div>
          </div>

          <Section id="quickstart" title="Quickstart">
            <ol className="list-decimal list-inside space-y-2 text-foreground">
              <li>Crée un compte gratuit sur <a href="/auth?mode=signup" className="text-brand hover:underline">/auth</a></li>
              <li>Génère une clé API depuis ton <a href="/dashboard" className="text-brand hover:underline">dashboard</a></li>
              <li>Lance ta première requête :</li>
            </ol>
            <Tabs value={tab} onValueChange={setTab} className="mt-4 not-prose">
              <TabsList>
                <TabsTrigger value="curl">curl</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
              </TabsList>
              <TabsContent value="curl"><CodeBlock code={samples.curl} language="bash" /></TabsContent>
              <TabsContent value="js"><CodeBlock code={samples.js} language="javascript" /></TabsContent>
              <TabsContent value="python"><CodeBlock code={samples.python} language="python" /></TabsContent>
              <TabsContent value="node"><CodeBlock code={samples.node} language="javascript" /></TabsContent>
            </Tabs>
          </Section>

          <Section id="auth" title="Authentification">
            <p>Toutes les requêtes nécessitent une clé API dans le header <code className="font-mono bg-surface px-1.5 py-0.5 rounded text-xs">x-api-key</code>.</p>
            <p>Format : <code className="font-mono bg-surface px-1.5 py-0.5 rounded text-xs">vk_live_xxxxxxxxxxxx</code></p>
            <p className="text-sm text-muted-foreground">Garde tes clés secrètes. Ne les expose jamais côté client en production — utilise un backend proxy.</p>
          </Section>

          <Section id="tts" title="POST /tts — Générer de la parole">
            <p>Convertit du texte en flux audio MP3.</p>
            <h4 className="font-heading font-semibold mt-4">Body JSON</h4>
            <table className="text-sm w-full not-prose mt-2">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2 pr-4">Champ</th><th className="text-left">Type</th><th className="text-left">Description</th></tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50"><td className="py-2 pr-4">text</td><td>string</td><td>Texte à synthétiser (max 5000 char)</td></tr>
                <tr><td className="py-2 pr-4">voice</td><td>string</td><td>ShortName de la voix (ex: fr-FR-DeniseNeural)</td></tr>
              </tbody>
            </table>
            <h4 className="font-heading font-semibold mt-4">Réponse</h4>
            <p>Flux <code>audio/mpeg</code> avec header <code>x-used-voice</code> indiquant la voix réellement utilisée (peut différer si fallback).</p>
          </Section>

          <Section id="voices" title="GET /voices — Lister toutes les voix">
            <CodeBlock code={`curl ${PROXY_URL}/voices -H "x-api-key: vk_live_..."`} language="bash" />
            <p>Retourne un tableau d'objets voix avec <code>ShortName</code>, <code>Locale</code>, <code>Gender</code>, <code>FriendlyName</code>.</p>
          </Section>

          <Section id="voices-by-language" title="GET /voices-by-language/:code">
            <p>Filtre les voix par préfixe de langue (ex: <code>fr</code>, <code>en</code>, <code>es</code>).</p>
            <CodeBlock code={`curl ${PROXY_URL}/voices-by-language/fr -H "x-api-key: vk_live_..."`} language="bash" />
            <p>Retourne <code>{`{ male_voices: [...], female_voices: [...] }`}</code></p>
          </Section>

          <Section id="voices-by-text" title="POST /voices-by-text — Détection auto">
            <p>Détecte la langue du texte et retourne les voix correspondantes.</p>
            <CodeBlock code={`curl -X POST ${PROXY_URL}/voices-by-text \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Bonjour tout le monde"}'`} language="bash" />
          </Section>

          <Section id="errors" title="Erreurs">
            <table className="text-sm w-full not-prose">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2 pr-4">Code</th><th className="text-left">Signification</th></tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50"><td className="py-2 pr-4">401</td><td>Clé API manquante ou révoquée</td></tr>
                <tr className="border-b border-border/50"><td className="py-2 pr-4">429</td><td>Quota mensuel dépassé (50 000 caractères)</td></tr>
                <tr className="border-b border-border/50"><td className="py-2 pr-4">400</td><td>Body invalide</td></tr>
                <tr><td className="py-2 pr-4">500</td><td>Erreur serveur — réessayer</td></tr>
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </div>
  );
}
