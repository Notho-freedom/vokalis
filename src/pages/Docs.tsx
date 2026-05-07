import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { PROXY_URL, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sections = [
  { id: "quickstart", label: "quickstart" },
  { id: "auth", label: "authentication" },
  { id: "tts", label: "POST /tts" },
  { id: "streaming", label: "POST /tts/stream" },
  { id: "translate", label: "POST /translate" },
  { id: "tts-translated", label: "POST /tts/translated" },
  { id: "voices", label: "GET /voices" },
  { id: "detect", label: "POST /detect-language" },
  { id: "errors", label: "errors" },
];

const samples: Record<string, string> = {
  curl: `curl -X POST ${PROXY_URL}/tts \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Hello world","voice":"en-US-AriaNeural"}' \\
  --output speech.mp3`,
  js: `const res = await fetch("${PROXY_URL}/tts", {
  method: "POST",
  headers: {
    "x-api-key": "vk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "Hello world",
    voice: "en-US-AriaNeural",
  }),
});

const blob = await res.blob();
new Audio(URL.createObjectURL(blob)).play();`,
  python: `import requests

r = requests.post(
    "${PROXY_URL}/tts",
    headers={"x-api-key": "vk_live_..."},
    json={"text": "Hello world", "voice": "en-US-AriaNeural"},
)
open("speech.mp3", "wb").write(r.content)`,
  node: `import fs from "node:fs";

const r = await fetch("${PROXY_URL}/tts", {
  method: "POST",
  headers: { "x-api-key": "vk_live_...", "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hello world", voice: "en-US-AriaNeural" }),
});
fs.writeFileSync("speech.mp3", Buffer.from(await r.arrayBuffer()));`,
};

const STREAM_SAMPLE = `// Browser — play as it streams
const r = await fetch("${PROXY_URL}/tts/stream", {
  method: "POST",
  headers: { "x-api-key": "vk_live_...", "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Lorem ipsum dolor sit amet…" }),
});
const blob = await r.blob();
new Audio(URL.createObjectURL(blob)).play();`;

const TRANSLATE_SAMPLE = `curl -X POST ${PROXY_URL}/translate \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Hello world","target_lang":"fr"}'

# → { "translated": "Bonjour le monde", "source_lang": "auto", "target_lang": "fr" }`;

const TTS_TRANSLATED_SAMPLE = `curl -X POST ${PROXY_URL}/tts/translated \\
  -H "x-api-key: vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Hello world","target_lang":"ja"}' \\
  --output speech_ja.mp3
# Auto-translates to Japanese, picks a Japanese voice, returns MP3.`;

function Section({ id, num, title, children }: any) {
  return (
    <section id={id} className="scroll-mt-20 py-12 border-t hairline first:border-0">
      <div className="mono-label text-muted-foreground mb-4">{num} — {id}</div>
      <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-6">{title}</h2>
      <div className="font-prose text-foreground/90 space-y-4 [&_a]:text-signal [&_a]:underline [&_code]:font-mono [&_code]:text-xs [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:border [&_code]:hairline">
        {children}
      </div>
    </section>
  );
}

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <table className="w-full font-mono text-xs border hairline mt-4">
      <thead className="bg-surface">
        <tr className="border-b hairline">
          <th className="text-left p-2 mono-label text-muted-foreground">field</th>
          <th className="text-left p-2 mono-label text-muted-foreground">type</th>
          <th className="text-left p-2 mono-label text-muted-foreground">description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([f, t, d]) => (
          <tr key={f} className="border-b hairline last:border-0">
            <td className="p-2">{f}</td>
            <td className="p-2 text-muted-foreground">{t}</td>
            <td className="p-2 text-muted-foreground">{d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Docs() {
  const [tab, setTab] = useState("curl");
  const tabs = [["curl", "curl"], ["js", "javascript"], ["python", "python"], ["node", "node"]];

  return (
    <div>
      {/* Header */}
      <div className="border-b hairline">
        <div className="container py-8">
          <div className="mono-label text-muted-foreground mb-3">/ docs · v2.0</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight">
            The <span className="italic">manual.</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-3 break-all">
            base url · <span className="text-foreground">{PROXY_URL}</span>
          </p>
        </div>
      </div>

      <div className="container py-10 grid lg:grid-cols-[200px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 space-y-1">
            <div className="mono-label text-muted-foreground mb-3">// contents</div>
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className="block px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-surface transition">
                <span className="text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</span>{"  "}{s.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Body */}
        <div>
          <Section id="quickstart" num="01" title="Quickstart.">
            <ol className="font-mono text-sm space-y-2 list-none pl-0">
              <li>→ create an account at <a href="/auth?mode=signup">/auth</a></li>
              <li>→ generate an API key at <a href="/dashboard">/dashboard</a></li>
              <li>→ make your first call:</li>
            </ol>
            <div className="border hairline bg-surface mt-4">
              <div className="flex border-b hairline">
                {tabs.map(([k, l]) => (
                  <button key={k} onClick={() => setTab(k)} className={cn(
                    "px-4 py-2 text-xs font-mono uppercase tracking-wider transition",
                    tab === k ? "text-foreground bg-background" : "text-muted-foreground hover:text-foreground"
                  )}>{l}</button>
                ))}
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">{samples[tab]}</pre>
            </div>
          </Section>

          <Section id="auth" num="02" title="Authentication.">
            <p>All requests authenticate via the <code>x-api-key</code> header.</p>
            <p>Format · <code>vk_live_xxxxxxxxxxxx</code> · 32 random bytes hex-encoded, prefixed.</p>
            <p className="text-muted-foreground text-sm">Keep keys server-side. Never ship them to a browser bundle in production.</p>
          </Section>

          <Section id="tts" num="03" title="POST /tts — synthesize.">
            <p>Convert text into a complete MP3 audio buffer. Returns the full payload once generated.</p>
            <Table rows={[
              ["text", "string", "1 to 5000 characters"],
              ["voice", "string?", "ShortName (auto-picked from text language if omitted)"],
              ["rate", "string?", "Speech rate, e.g. +10%, -5%"],
              ["pitch", "string?", "Pitch offset, e.g. +2Hz"],
              ["persona", "string?", "news / cheerful / calm / friendly"],
            ]} />
            <p className="text-sm text-muted-foreground">Response · <code>audio/mpeg</code> · header <code>x-used-voice</code></p>
          </Section>

          <Section id="streaming" num="04" title="POST /tts/stream — chunked synthesis.">
            <p>Same body as <code>/tts</code>, but the MP3 is streamed back chunk-by-chunk via <code>Transfer-Encoding: chunked</code>. First byte arrives in ~300ms — perfect for live playback or low-latency agent loops.</p>
            <CodeBlock code={STREAM_SAMPLE} language="javascript" />
          </Section>

          <Section id="translate" num="05" title="POST /translate.">
            <p>Translate any text to a target language. Free, no key beyond your <code>x-api-key</code>.</p>
            <Table rows={[
              ["text", "string", "Text to translate"],
              ["target_lang", "string", "ISO 639-1 code (fr, en, ja, zh-CN…)"],
              ["source_lang", "string?", "Defaults to auto-detect"],
            ]} />
            <CodeBlock code={TRANSLATE_SAMPLE} language="bash" />
          </Section>

          <Section id="tts-translated" num="06" title="POST /tts/translated — translate + synth.">
            <p>One call, one audio. We translate your text, pick a fitting voice in the target language, and return the MP3.</p>
            <CodeBlock code={TTS_TRANSLATED_SAMPLE} language="bash" />
          </Section>

          <Section id="voices" num="07" title="GET /voices.">
            <p>Returns the full catalog of neural voices with locale, gender, and persona tags.</p>
            <CodeBlock code={`curl ${PROXY_URL}/voices -H "x-api-key: vk_live_..."`} language="bash" />
          </Section>

          <Section id="detect" num="08" title="POST /detect-language.">
            <p>Robust detection (Lingua) — returns the dominant language plus alternates with confidence.</p>
            <CodeBlock code={`curl -X POST ${PROXY_URL}/detect-language \\
  -H "x-api-key: vk_live_..." \\
  -d '{"text":"Bonjour tout le monde"}'

# → { "lang": "fr", "confidence": 0.998, "alternates": [...] }`} language="bash" />
          </Section>

          <Section id="errors" num="09" title="Errors.">
            <table className="w-full font-mono text-xs border hairline">
              <tbody>
                {[
                  ["401", "Missing or revoked API key"],
                  ["422", "Invalid request body"],
                  ["429", "Monthly quota exceeded (50 000 chars)"],
                  ["500", "Upstream synthesis failure"],
                ].map(([c, d]) => (
                  <tr key={c} className="border-b hairline last:border-0">
                    <td className="p-2 w-16 text-signal">{c}</td>
                    <td className="p-2 text-muted-foreground">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <div className="py-12 text-center mono-label text-muted-foreground">
            — end of manual · {APP_NAME.toLowerCase()} v2.0 —
          </div>
        </div>
      </div>
    </div>
  );
}
