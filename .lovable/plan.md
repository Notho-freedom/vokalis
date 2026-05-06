# Vocalis — Plateforme TTS

Transformation complète du projet actuel (Aura Campaigns) en service Text-to-Speech basé sur le backend FastAPI déjà déployé sur `https://low-tts.onrender.com`.

## 1. Identité & design

- **Nom proposé** : *Vocalis* (modifiable)
- **Thème** : sombre par défaut + toggle clair, accent **violet → cyan néon** (gradient), typographie Space Grotesk (titres) + Inter (corps), grain subtil, glow halos, style "developer tool" premium type Vercel/Linear
- Reset complet de `index.css` (palette violet/cyan), nouveaux tokens `--brand`, `--brand-2`, `--surface`, états sombre/clair via classe `dark`
- ThemeProvider + toggle dans le header

## 2. Architecture des pages

```
/                    Landing (hero + démo live + features + voix populaires + CTA)
/playground          Playground TTS interactif
/voices              Bibliothèque de voix (filtres langue/genre/pays + previews)
/docs                Documentation API (endpoints, exemples curl/JS/Python)
/dashboard           (auth) Clés API, usage, historique
/auth                Login + Signup (email/password + Google)
```

Suppression des pages campagnes (`CampaignDetail`, store campaign, dialogs) et du code Vapi non pertinent (on garde l'edge function Vapi en place mais on la débranche du front).

## 3. Intégration backend TTS

Toutes les requêtes passent par un **proxy edge function** `tts-proxy` côté Lovable Cloud, qui :
- Vérifie la clé API (header `x-api-key`) ou la session utilisateur
- Incrémente le compteur d'usage (table `api_usage`)
- Forward vers `https://low-tts.onrender.com` (configurable via secret `TTS_BACKEND_URL`)
- Renvoie le flux audio MP3 ou JSON

Routes côté front exposées via le proxy :
- `POST /tts` → synthèse (text, voice) → MP3
- `GET /voices` → toutes les voix (caché 1h en mémoire edge)
- `GET /voices-by-language/:code`
- `POST /voices-by-text` (détection auto langue)
- `GET /status`

Dans le playground, on appelle directement le backend public pour la latence (pas besoin de clé), mais le dashboard montre les exemples via le proxy avec clé API.

## 4. Authentification & base de données

Auth Lovable Cloud : email/password + Google. Pas de profil étendu nécessaire pour démarrer (on peut ajouter `profiles` plus tard pour avatar/nom).

Tables :

```
api_keys
  id uuid pk
  user_id uuid → auth.users
  name text                 -- "Production", "Test"
  key_prefix text           -- "vk_live_abcd" (affiché)
  key_hash text             -- SHA-256 stocké
  last_used_at timestamptz
  created_at timestamptz
  revoked_at timestamptz nullable

api_usage
  id uuid pk
  user_id uuid
  api_key_id uuid nullable
  endpoint text             -- "tts" | "voices" | ...
  characters int            -- longueur texte synthétisé
  voice text nullable
  status int
  created_at timestamptz

favorite_voices
  id uuid pk
  user_id uuid
  voice_short_name text
  created_at timestamptz
  unique(user_id, voice_short_name)
```

RLS :
- `api_keys` : select/insert/update où `user_id = auth.uid()` (jamais exposer `key_hash`)
- `api_usage` : select uniquement le sien ; insert via service role depuis l'edge function
- `favorite_voices` : CRUD propriétaire

Génération de clé : format `vk_live_<32 chars random>`, hash SHA-256 en DB, valeur claire montrée **une seule fois** à la création.

## 5. Playground (`/playground`)

- Grand textarea (max 5000 char, compteur)
- Sélecteur langue (auto-détection bouton "Détecter")
- Liste filtrable des voix de la langue sélectionnée (cards avec genre, locale, badges Neural)
- Bouton **Générer** → appel `/api/tts` backend → lecteur audio waveform animé + bouton télécharger MP3
- Bouton "Voix aléatoire" pour explorer
- Affichage du header `X-Used-Voice` quand fallback déclenché
- Persistance des 10 dernières générations en localStorage (et en DB si connecté)

## 6. Bibliothèque (`/voices`)

- Grid de cards voix (chargé via `/api/voices`)
- Filtres : recherche texte, langue (multi), genre, pays
- Mini-preview : bouton play qui synthétise une phrase démo de 2-3 mots dans la langue
- Bouton "favori" si connecté
- Bouton "copier ShortName" pour les devs

## 7. Documentation (`/docs`)

Layout sidebar + contenu, sections :
- **Quickstart** (auth header, première requête)
- **Authentification** (header `x-api-key`)
- **Endpoints** : `/tts`, `/voices`, `/voices-by-language`, `/voices-by-text`, `/check-voice`, `/status`
- **Code samples** avec onglets : `curl`, `JavaScript (fetch)`, `Python (requests)`, `Node.js`
- **Voix recommandées** (top 10 multilingues)
- **Limites & quotas** (ex: 10 000 char/mois free)
- **Erreurs** (codes & messages)

Coloration syntaxique via `react-syntax-highlighter` ou `shiki`.

## 8. Dashboard (`/dashboard`)

- Vue clés API (créer, renommer, révoquer, copier) avec modale "clé visible une seule fois"
- Graph usage 30 jours (caractères/jour) — Recharts (déjà installé)
- Top voix utilisées
- Quota du mois (barre progression)
- Historique récent (table dernières 50 requêtes)

## 9. Landing (`/`)

- Hero : gros titre "Synthèse vocale, gratuite, illimitée*", sous-titre, 2 CTA ("Essayer le playground", "Voir la doc"), démo live mini-playground intégrée (1 phrase préremplie)
- Section features (4 cards : 400+ voix, 100+ langues, API REST simple, gratuit)
- Démo code (bloc curl animé typewriter)
- Showcase voix populaires (carrousel)
- Stats animées (nombre voix, langues, requêtes)
- Footer avec liens GitHub/Twitter/contact

## 10. Étapes d'implémentation

1. **Cleanup** : supprimer pages/composants campagnes (`CampaignDetail`, `CampaignStats`, `CreateCampaignDialog`, `AddParticipantDialog`, `StatusBadge`, `campaignStore`, `types/campaign`)
2. **Design system** : refonte `index.css` + `tailwind.config.ts` (palette violet/cyan, dark mode class, gradients, shadows)
3. **Layout** : `AppLayout` avec header (logo, nav, theme toggle, login/avatar), footer, ThemeProvider
4. **Migrations DB** : enum, tables `api_keys` / `api_usage` / `favorite_voices`, RLS, fonction `hash_api_key`
5. **Auth** : `/auth` page (tabs login/signup, Google OAuth via `lovable.auth.signInWithOAuth`), guard `useAuth` hook
6. **Edge functions** :
   - `tts-proxy` (forward vers backend + tracking usage si clé API)
   - `create-api-key` (génère, hash, stocke, retourne clé claire une fois)
   - `revoke-api-key`
7. **Pages** : Landing → Playground → Voices → Docs → Dashboard
8. **TTS client** : hook `useTTS` (cache liste voix, génération, lecteur audio)
9. **Composants UI** : `VoiceCard`, `CodeBlock` (avec copy), `WaveformPlayer`, `ApiKeyDialog`, `UsageChart`

## Détails techniques

- Backend public utilisé direct depuis le browser pour playground (CORS déjà ouvert côté FastAPI : `allow_origins=["*"]`)
- Les exemples montrés dans `/docs` pointent vers le proxy edge function `https://hmbsmkauhjinxdjnlysn.supabase.co/functions/v1/tts-proxy` (URL "officielle" Vocalis) avec header `x-api-key`
- Cache liste voix : React Query avec `staleTime: 1h`
- Détection langue côté client : on peut utiliser `franc-min` (lib légère) ou simplement appeler `/api/voices-by-text`
- Lecteur audio : `<audio>` HTML5 + visualisation custom canvas (waveform animée pendant lecture)
- Validation Zod sur tous les inputs edge functions
- Quota mensuel libre : 50 000 caractères/mois/utilisateur (modifiable), reset 1er du mois via comptage `api_usage`

## Hors scope (futur)

- Streaming temps réel (WebSocket)
- Voice cloning
- SSML avancé
- Webhooks pour batch processing
- Plans payants

---

Une fois validé, je commence par le cleanup + design system, puis monte les pages dans l'ordre Landing → Playground → Voices → Docs → Auth/Dashboard.
