# Vocalis

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/) [![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

**Voix synthétique. Gratuite. Sans limite.**

Vocalis is a web-based text-to-speech studio built around a browser client and a dedicated TTS backend. It combines voice synthesis, streaming playback, multi-voice projects, language tools, captions, and an interactive studio UI.

## What it does

- **TTS playground** — synthesize text with selectable neural voices and play the result directly in the browser.
- **Streaming synthesis** — consume MP3 audio as a `ReadableStream` for lower-latency playback.
- **Voice library** — load available voices and filter them by locale and voice metadata.
- **Voice Lab** — build multi-voice dialogue projects with voice, rate, pitch, and pause controls.
- **Reader** — turn articles and documents into spoken content.
- **Karaoke captions** — generate timed caption data and export SRT/VTT files.
- **Language tools** — detect language, find suitable voices, and translate text.
- **Projects & sharing** — organize generated content and expose shareable project pages.
- **Health & resilience** — monitor the TTS service and automatically fail over between configured backends when a backend is unavailable or returns a server error.

## Architecture

Vocalis is split between the frontend application and the TTS services it consumes:

```text
Browser
  │
  ├── React / TypeScript / Vite
  ├── Studio UI + routing
  ├── Supabase authentication/data
  │
  ▼
TTS API
  ├── /api/voices
  ├── /api/tts
  ├── /api/tts/stream
  ├── /api/tts/dialogue
  ├── /api/captions
  ├── /api/detect-language
  ├── /api/translate
  └── /api/health
```

The frontend keeps a list of TTS backends and promotes the last backend that responded successfully, while falling back to the other configured endpoint when a network failure or 5xx response occurs.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Vocalis landing page and interactive TTS demo |
| `/playground` | Text-to-speech workspace |
| `/voices` | Voice browser |
| `/personas` | Voice/persona library |
| `/lab` | Multi-voice creation workspace |
| `/reader` | Reading experience |
| `/karaoke` | Caption and karaoke workflow |
| `/projects` | Projects workspace |
| `/share/:slug` | Shared project view |
| `/docs` | Product/API documentation |
| `/status` | Service status |
| `/dashboard` | Authenticated dashboard |

## Tech stack

- **Frontend:** React 18, TypeScript, Vite 5
- **Routing:** React Router
- **Data/auth:** Supabase, TanStack Query
- **UI:** Tailwind CSS, Radix UI, Lucide React
- **Motion:** Framer Motion
- **Forms & validation:** React Hook Form + Zod
- **Charts/media UI:** Recharts, Embla Carousel and custom audio/visualization components
- **Testing:** Vitest + Testing Library
- **Backend:** external TTS HTTP services consumed by the frontend

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Run linting and tests:

```bash
npm run lint
npm test
```

Run Vitest in watch mode:

```bash
npm run test:watch
```

## Backend configuration

The frontend currently has a primary TTS backend and a fallback backend configured in `src/lib/constants.ts`. The TTS client communicates with those services through endpoints such as `/api/tts`, `/api/tts/stream`, `/api/voices`, and `/api/captions`.

Supabase project configuration is used by the application for its authenticated/data layer. Keep environment-specific credentials out of source control and provide them through your local environment when required by the current implementation.

## Project structure

```text
src/
├── components/      # UI and motion components
├── hooks/            # Authentication and application hooks
├── lib/              # TTS client, constants and utilities
├── pages/            # Product routes
├── assets/           # Visual assets and media metadata
└── App.tsx           # Application routing/providers
```

## Status

Vocalis is an active experimental/product workspace rather than a minimal Vite starter. The current codebase already contains the studio, voice, reader, karaoke, project, sharing, documentation and service-status surfaces described above. Backend availability and some product capabilities depend on the configured TTS services.

## License

No license file is currently documented in this README. Check the repository's current licensing files and terms before redistributing the project.

## Author

**Ravel Momo** — [@Notho-freedom](https://github.com/Notho-freedom)
