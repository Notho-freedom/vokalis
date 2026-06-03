# Corrections Reader / Karaoke / Voices / Personas + nouveau backend

## 1. Nouveau backend URL
- `src/lib/constants.ts` : `TTS_BACKEND_URL = "https://vokalis.onrender.com"`.

## 2. Composant réutilisable `VoicePicker`
Nouveau `src/components/VoicePicker.tsx` : deux `<Select>` (langue + voix) alimentés par `fetchVoices()`, avec :
- Détection auto initiale via `detectLanguage(text)` (callable via prop `text`)
- Badge "auto-détecté : Français" + bouton "changer"
- Liste des langues triée, voix filtrées par locale, groupées Female/Male
- Preview ▶ courte par voix
- `value`/`onChange` standard

Utilisé dans Reader + Karaoke (et plus tard ailleurs).

## 3. Reader (`src/pages/Reader.tsx`)
- Après extraction du texte/PDF : auto-`detectLanguage()` sur les 2000 premiers chars
- Affiche `<VoicePicker>` au-dessus de la liste des chapitres
- Le voice sélectionné est utilisé pour `synthesize()` de tous les chapitres
- Si la langue change manuellement → reset des audioUrl déjà générés

## 4. Karaoke (`src/pages/Karaoke.tsx`)
- Remplace l'`<input>` voice texte par `<VoicePicker text={text}>`
- Auto-détection sur changement de texte (debounce 600ms)

## 5. Voices (`src/pages/Voices.tsx`)
Le problème "voix seulement anglaises" : ajouter une zone "Détecter depuis un texte" en haut du sidebar :
- Textarea + bouton "Détecter"
- Appelle `detectLanguage` → set `lang` au code détecté
- Affiche la confiance et un bouton "voir toutes les langues"

(La logique de filtre existait déjà ; le bug perçu vient du fait que rien ne déclenche la sélection auto — on l'ajoute.)

## 6. Personas — portraits uniques
Chaque persona partage actuellement 6 images recyclées. Génération de **12 portraits cinématiques uniques** via `imagegen` (style Hollywood, éclairage studio dramatique, cohérent avec le thème ambre/noir) :
- `voice-portrait-thriller.jpg`, `-fm-news.jpg`, `-meditation.jpg`, `-yt.jpg`, `-luxury.jpg`, `-romance.jpg`, `-ted.jpg`, `-nature.jpg`, `-cartoon.jpg`, `-tutorial.jpg`, `-investor.jpg`, `-trailer.jpg`
- Mise à jour de `src/data/personas.ts` : un import dédié par persona
- Suppression (delete_asset) des anciens `voice-portrait-1..6.jpg` une fois remplacés

## Hors-scope
- Refonte Playground (utilisateur a dit "on regarde pas")
- Animations (déjà OK selon utilisateur)
- Backend Python (pas touché)

## Détails techniques
- `VoicePicker` props : `value: string`, `onChange: (v: string) => void`, `text?: string` (pour auto-détect), `className?: string`
- Utilise `useQuery(["voices"])` partagé → pas de re-fetch
- Langues affichées via `langName()` + `countryFlag()`
- Debounce détection : `useEffect` + `setTimeout` 600ms sur `text`
- Si détection retourne une langue sans voix dispo → fallback `en` + toast info
