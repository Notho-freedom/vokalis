# Refonte Vocalis — Design éditorial + Backend amélioré

Deux chantiers : (1) refondre intégralement l'UI pour sortir du "template IA générique", (2) regrouper et étendre le code Python dans `backend/` (traduction, streaming, détection améliorée).

---

## 1. Direction artistique — "Editorial Studio"

Abandon du look SaaS violet/cyan néon générique. On vise un truc qui ressemble à un **studio audio éditorial** : monospace dominant, grille typographique, contraste brutal, un seul accent chromatique.

**Système visuel**
- Palette dark stricte : fond `#0A0A0A`, surface `#111`, bordure `#1F1F1F`, texte `#EDEDED`, muted `#6B6B6B`
- **Un seul accent** : vert phosphore `#B6F500` (signal "on air", boutons primaires, waveform). Plus de gradient violet/cyan partout.
- Light mode : papier `#F5F4F0` (off-white type Linear/Vercel), encre `#0A0A0A`, accent identique
- Typo : **JetBrains Mono** partout pour labels/UI/nav, **Fraunces** (serif éditorial) pour titres hero, **Inter** uniquement pour paragraphes longs
- Pas de cards génériques arrondies xl avec glow. Bordures 1px nettes, radius 4-6px max, aucune `shadow-glow`.
- Grille visible discrète, bandes horizontales numérotées (`01 — Playground`), timestamps monospace partout

**Composants à refaire from scratch**
- `Header` : barre fine 48px, logo = mot `vocalis` en lowercase + point clignotant vert quand audio joue, nav inline avec séparateurs `/`
- `Footer` : bandeau type colophon de magazine (3 colonnes denses, version, statut backend en live)
- `Layout` : conteneur max-width 1200px, padding latéral généreux, fond avec subtil bruit film
- Boutons : flat, bordure 1px, hover = inversion couleur (pas de glow)
- Inputs : soulignés (border-bottom uniquement), pas de border tout autour

**Pages refaites**

- **Landing (`/`)** : hero pleine hauteur avec un seul énorme mot serif animé qui change de langue (`bonjour / hello / 你好 / مرحبا`), sous-titre mono, démo inline (textarea + bouton "synthesize" qui révèle un waveform), section "specs" en tableau monospace (400+ voix, 100+ langues, 0€), section voix featured en liste (pas en carrousel), CTA final minimal.
- **Playground (`/playground`)** : layout 2 colonnes — gauche : éditeur texte plein écran avec compteur live (caractères/durée estimée) ; droite : panneau voix (recherche, filtre, 1 voix sélectionnée mise en valeur). Barre du bas fixe : waveform live pendant streaming, contrôles transport (play/pause/seek/download/copy URL), indicateur latence.
- **Voices (`/voices`)** : liste dense type catalogue de bibliothèque (pas grille de cards). Lignes avec : drapeau, ShortName mono, langue, genre, badge personnalité, bouton play inline. Filtres dans une sidebar gauche fixe. Vue alternative grille minimaliste optionnelle.
- **Docs (`/docs`)** : layout 3 colonnes (sommaire fixe / contenu / exemple code sticky). Style type Stripe/Linear docs : prose serif, code mono dark, switcher de langage (curl/JS/Python/Node) en haut du panneau code.
- **Dashboard (`/dashboard`)** : tableau de bord type terminal — header avec quota (barre fine, pas de donut coloré), grand tableau usage récent (mono, sortable), graphique line minimal noir/vert, gestion clés en table éditable inline.
- **Auth (`/auth`)** : page split-screen, gauche citation/baseline éditoriale, droite formulaire minimal.

**Micro-interactions**
- Curseur custom sur waveform (barre verticale verte)
- Transition de page : fondu rapide 120ms, pas de slide tape-à-l'œil
- Voix qui joue : point vert clignote dans le header + ligne soulignée dans la liste
- Pas de framer-motion sur tout. Animations CSS sobres uniquement.

---

## 2. Backend Python — `backend/`

Création d'un dossier `backend/` à la racine pour regrouper le code Python (l'utilisateur déploie lui-même sur Render).

```text
backend/
├── app.py                  # FastAPI principal
├── routes/
│   ├── tts.py              # /api/tts (existant + amélioré)
│   ├── tts_stream.py       # NOUVEAU /api/tts/stream
│   ├── voices.py           # /api/voices, /api/voices-by-text
│   ├── translate.py        # NOUVEAU /api/translate, /api/tts/translated
│   └── detect.py           # /api/detect-language (extrait + amélioré)
├── services/
│   ├── edge_tts_engine.py  # wrapper edge-tts
│   ├── language.py         # détection (langdetect/lingua) + util
│   └── translator.py       # NOUVEAU (deep-translator: Google gratuit)
├── models/
│   └── schemas.py          # Pydantic
├── utils/
│   └── voice_picker.py     # sélection voix par locale + genre + persona
├── tests/
│   ├── test_tts.py
│   ├── test_translate.py
│   └── test_stream.py
├── requirements.txt
├── Dockerfile
└── README.md
```

**Nouvelles routes**

- `POST /api/tts/stream` — streaming audio chunké via `StreamingResponse` MP3, headers `X-Used-Voice`, `Transfer-Encoding: chunked`. Permet lecture immédiate dans `<audio>` côté client (MediaSource API).
- `POST /api/translate` — `{ text, target_lang, source_lang? }` → texte traduit (deep-translator, GoogleTranslator gratuit). Retourne `{ translated, detected_source }`.
- `POST /api/tts/translated` — combine traduction + TTS en un appel : `{ text, target_lang, voice? }` → audio dans la langue cible avec voix auto-sélectionnée si non fournie.
- `POST /api/detect-language` — exposition propre de la détection (lingua-language-detector, plus robuste que langdetect), retourne `{ lang, confidence, alternates[] }`.
- `GET /api/health` — uptime, version, modèles chargés.

**Améliorations existantes**
- Cache LRU 256 entrées sur `/api/voices` (rechargement edge-tts coûteux)
- Sélection voix : pondération par popularité + paramètre `persona` ("calm", "news", "cheerful")
- Validation Pydantic stricte (max 5000 chars, langue ISO valide)
- Logging structuré JSON
- Rate limit basique en mémoire (slowapi)

**Tests** : pytest async, coverage des nouvelles routes, fixtures pour mock edge-tts.

---

## 3. Intégration front ↔ backend

- `src/lib/tts.ts` étendu : `synthesizeStream()` (fetch + ReadableStream → MediaSource), `translate()`, `detectLanguage()`.
- `tts-proxy` edge function : ajout passthrough streaming (relai du body chunké) + nouveaux endpoints `/translate` et `/tts/translated` avec comptage caractères dans `api_usage`.
- Playground : toggle "Streaming" (défaut on), traduction inline ("Traduire vers : [select]" avant synthèse).

---

## 4. Détails techniques

- Suppression de `framer-motion` pour les composants statiques (gain bundle), conservation pour transitions ciblées.
- Refonte `index.css` : nouvelles variables HSL, suppression des utilitaires `gradient-brand`, `shadow-glow`, `noise` lourd.
- `tailwind.config.ts` : ajout `font-serif: Fraunces`, retrait sidebar tokens inutilisés.
- Police chargée via `@fontsource` (auto-host) au lieu de Google Fonts CDN pour perf.
- MediaSource fallback : si non supporté, fetch complet puis lecture (déjà cas actuel).

---

## 5. Hors scope

- Voice cloning, SSML, webhooks, plans payants.
- Déploiement Python (l'utilisateur s'en charge).
- Migration DB (les tables actuelles suffisent ; on ajoute juste `endpoint='translate'` et `endpoint='tts_stream'` comme valeurs côté usage).

---

## Étapes d'exécution

1. Création `backend/` complet (app.py, routes, services, tests, requirements, Dockerfile, README).
2. Refonte design system (`index.css`, `tailwind.config.ts`, fonts).
3. Reconstruction `Layout`, `Header`, `Footer`.
4. Refonte page par page : Landing → Playground → Voices → Docs → Dashboard → Auth.
5. Extension `tts-proxy` (streaming + translate) et `src/lib/tts.ts`.
6. Branchement streaming + traduction dans Playground.
