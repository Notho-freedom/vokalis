
# Vocalis v2.1 — Motion Deep + Performance Push

L'app est déjà solide mais visuellement figée. On va remplacer les images statiques par du **mouvement permanent** (vidéos courtes, canvas réactifs, ondes animées), pousser l'API plus loin, et serrer les perfs côté backend.

---

## 1. Motion Deep — chasser les images statiques

**Principe** : aucune zone "hero" ne doit être figée. Trois techniques combinées selon le contexte :

### A. Vidéos courtes en boucle (hero, CTA)
Génération de **3 clips MP4 5s loopés** via `videogen` :
- `hero-loop.mp4` — onde sonore cinématique dorée qui pulse sur fond noir profond
- `studio-loop.mp4` — micro vintage avec lumière qui tourne lentement
- `cta-loop.mp4` — particules audio qui dérivent

Composant `<VideoBackdrop>` : `<video autoplay muted loop playsinline preload="metadata" poster={jpgFallback}>`. Fallback JPG si `prefers-reduced-motion` ou data saver.

### B. Canvas WebGL/2D réactifs (sections actives)
- **`<LiveWaveform>`** — canvas 2D qui se branche sur `AnalyserNode` quand l'audio joue (Hero demo, Playground, Share). Quand l'audio est en pause, animation de fond procédurale (sinusoïde + bruit Perlin léger).
- **`<SpectrogramCanvas>`** — remplace l'image spectrogram statique. WebGL si dispo, fallback canvas 2D. Couleurs HSL `--signal`.
- **`<ParticleField>`** — fond du CTA final, 80 particules ambiantes qui réagissent au scroll velocity.

### C. SVG animés / Lottie-like (portraits & cartes)
- **Portraits de voix** : overlay d'une onde SVG animée sur chaque portrait (stroke-dasharray loop) qui pulse plus fort au hover et joue un sample 1.5s au survol.
- **Cartes features** : icône Lucide qui se redessine (stroke-dashoffset) à l'entrée dans le viewport.
- **Ticker** : déjà animé, on ajoute des micro-dots qui scintillent au passage.

### D. Curseur audio personnalisé
Sur `/`, `/playground`, `/lab` : curseur custom qui laisse une traînée d'onde sinusoïdale sur les zones interactives (CSS `mix-blend-mode: difference`).

---

## 2. Pages qui passent en mouvement

| Page | Avant | Après |
|---|---|---|
| `/` Hero | image statique waveform | `hero-loop.mp4` + `<LiveWaveform>` qui réagit à la démo |
| `/` Personas section | image spectrogram | `<SpectrogramCanvas>` qui tourne |
| `/` Dev section | image studio-mic | `studio-loop.mp4` + overlay code qui se tape (typewriter sync au frame) |
| `/` CTA | image waveform | `<ParticleField>` + onde qui s'élargit au hover du bouton |
| `/voices` | grille statique | hover = portrait pulse + sample 1.5s auto-play |
| `/playground` | textarea + bouton | onde live temps réel pendant le streaming |
| `/lab` | timeline statique | playhead animé + waveforms par track (canvas) |
| `/share/:slug` | player simple | grand visualizer plein écran |
| `/personas` | cartes plates | chaque carte = mini canvas avec signature visuelle (couleur, rythme) |
| `/status` | bullet points | graphes live (sparkline animée) + onde de health |
| Header | dot statique | dot qui pulse en rythme avec le dernier TTS joué globalement |

---

## 3. Push l'API plus loin

Nouvelles capacités (toutes via `tts-proxy` + backend FastAPI) :

### Backend (nouvelles routes)
- **`POST /api/tts/sse`** — streaming **Server-Sent Events** avec metadata par chunk (`{offset_ms, char_index, audio_b64}`) → permet le **karaoke / highlight sync** côté front.
- **`POST /api/tts/dialogue`** — multi-voix en une requête. Body : `[{voice, text, pause_after_ms}]`. Concat côté serveur (ffmpeg) → un seul MP3. Remplace la logique Web Audio actuelle du Lab par un endpoint propre.
- **`POST /api/tts/ssml`** — support SSML léger (breaks, emphasis, prosody) via edge-tts.
- **`POST /api/tts/voice-mix`** — crossfade entre 2 voix sur le même texte (effet de transition narrative).
- **`GET /api/voices/search?q=...&style=...&age=...&gender=...`** — recherche facettée (le front filtrera moins, le back plus).
- **`POST /api/captions`** — renvoie srt/vtt à partir du texte + durées edge-tts (word boundaries).

### Backend perf
- **Cache Redis-in-memory** (`cachetools.TTLCache`, 256MB) sur `(text_hash, voice, rate, pitch)` → réponses instantanées sur répétitions (docs, démos).
- **Pré-warm** des 20 voix les plus utilisées au startup (liste persistée).
- **httpx async pool** réutilisé + **uvloop** + **orjson** dans FastAPI.
- **Gzip/Brotli** sur réponses JSON > 1KB.
- **Streaming chunk size** abaissé à 4KB pour TTFB < 200ms.
- **Health endpoint enrichi** : p50/p95/p99 latency rolling 5min, cache hit rate, voices loaded.
- **Lifespan handler** propre pour la liste voices (warm cache au boot).

### Edge function (`tts-proxy`)
- Forward des nouveaux endpoints (sse, dialogue, ssml, voice-mix, captions).
- **Replay endpoint** : `GET /tts-proxy/replay/:id` retourne l'audio cached d'un appel précédent (debug dev).
- **Caching headers** : `Cache-Control: public, max-age=86400` quand `cache=true` dans body.

### Frontend SDK
- `vocalis.stream(text, { onWord })` exploitant SSE + word timings.
- `vocalis.dialogue([...])`.
- `vocalis.captions(text, voice)` → blob srt/vtt.

---

## 4. Nouvelles features front

- **`/karaoke`** — nouvelle page : colle un texte, lit avec **highlight mot-à-mot** synchronisé (utilise `/tts/sse`). Sortie SRT téléchargeable.
- **`/playground`** — toggle "Show captions" + visualizer plein écran optionnel.
- **`/lab`** — passage au endpoint `/tts/dialogue` (plus rapide qu'assembler en Web Audio). Waveform par piste rendue depuis l'API `/api/waveform` (peaks JSON).
- **Compare mode** sur `/voices` — sélectionne 2-3 voix, joue la même phrase en A/B/C, scope visuel par onde.
- **Auto-translate-and-speak** dans Playground — petit switch "speak in another language" qui chaîne `/translate` + `/tts`.
- **PWA + offline** — `vite-plugin-pwa`, service worker qui cache les assets et propose une mini-app mobile.

---

## 5. Performance front

- **Lazy + dynamic import** pour `/lab`, `/reader`, `/karaoke` (lourds : pdfjs, wavesurfer, canvas).
- **`vite-imagetools`** pour servir AVIF/WebP des portraits + `<picture>` avec poster JPG.
- **Preload** uniquement `hero-loop.mp4` poster + Fraunces 300 (subset latin).
- **`prefers-reduced-motion`** respecté partout (vidéos remplacées par poster, canvas pausés).
- **IntersectionObserver** pour pauser les canvas hors viewport.
- **Web Worker** pour FFT du visualizer (pas de jank sur le main thread).

---

## 6. Détails techniques

```text
src/
  components/
    motion/
      VideoBackdrop.tsx        # <video> + poster + reduced-motion
      LiveWaveform.tsx         # AnalyserNode canvas
      SpectrogramCanvas.tsx    # WebGL spectrogram
      ParticleField.tsx        # canvas particles
      AudioCursor.tsx          # custom cursor trail
      AnimatedWaveSVG.tsx      # SVG onde sur portraits
    GlobalAudioContext.tsx     # AudioContext unique partagé
  hooks/
    useAnalyser.ts             # branche un blob/stream → AnalyserNode
    usePrefersReducedMotion.ts
    useGlobalPulse.ts          # pulse rythmé par audio global
  pages/
    Karaoke.tsx                # nouvelle page
  assets/
    hero-loop.mp4              # généré
    studio-loop.mp4            # généré
    cta-loop.mp4               # généré
    hero-loop-poster.jpg
    studio-loop-poster.jpg
    cta-loop-poster.jpg

backend/
  routes/
    tts_sse.py
    dialogue.py
    ssml.py
    voice_mix.py
    captions.py
    waveform.py
  services/
    cache.py                   # TTLCache wrapper
    metrics.py                 # rolling latency stats
    ffmpeg.py                  # concat dialogues, crossfade
  app.py                       # lifespan + orjson + brotli + uvloop
  requirements.txt             # + uvloop, orjson, brotli-asgi, httpx
```

Migration SQL : nouvelle table `cached_synthesis` (text_hash, voice, audio_url storage, hit_count, last_hit_at) pour cache persistant cross-instance via le bucket `audio-exports`.

---

## 7. Hors scope (ce sprint)

- Voice cloning custom
- Mobile native
- Paiement (reste free)
- Refactor du player React global (on garde existant, on l'enveloppe)
- Refonte Auth/Dashboard (déjà OK)

---

## Ordre de livraison

1. Backend perf + nouvelles routes (sse, dialogue, ssml, captions, waveform, cache, metrics)
2. Edge function `tts-proxy` étendue + replay
3. Composants motion (`VideoBackdrop`, `LiveWaveform`, `SpectrogramCanvas`, `ParticleField`, `AudioCursor`)
4. Génération des 3 vidéos loops + posters
5. Refonte `/`, `/voices`, `/playground` avec motion
6. Nouvelle page `/karaoke` + captions
7. `/lab` migré sur `/tts/dialogue`
8. PWA + perfs front (lazy, imagetools, reduced-motion)

Tu approuves, j'enchaîne tout d'une traite.
