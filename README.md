# HybridCopilot

**Firebase #BuildHybridAI 2026** pre-build — on-device + cloud **Firebase AI Logic hybrid inference** field assistant for demos / trade-shows with flaky Wi‑Fi.

> Soft registration: Devpost user **er-s-an** (Caesar).  
> **Do not Submit** until the owner says 「交」. Full Rules / fee land ~**2026-11-09**; if an entry fee appears → **DROP** risk.

## Problem

Booth and field demos die when venue Wi‑Fi flaps. Cloud-only copilots stall; on-device-only copilots fail on unsupported browsers/devices. Staff need **intent → runnable answer** (checklist, talk track, troubleshooting) that keeps working across weak and strong links.

## Hybrid design

Same **Firebase AI Logic** client stack; routing chooses an official hybrid `InferenceMode`:

| Network quality | Mode | Behavior |
| --- | --- | --- |
| Offline | `ONLY_ON_DEVICE` | Chrome Prompt API / Gemini Nano only |
| Weak / metered (2g–3g, high RTT, save-data) | `PREFER_ON_DEVICE` | On-device first; cloud fallback |
| Strong (4g / good downlink) | `PREFER_IN_CLOUD` | Cloud first for richer answers; on-device if cloud unavailable |
| Unknown hints | `PREFER_ON_DEVICE` | Safe default for unreliable venues |

UI shows **`inferenceSource`** (`on_device` | `in_cloud`, or mock equivalents) so judges can see hybrid routing — not a cloud-only shell.

References:

- [Hybrid overview](https://firebase.google.com/docs/ai-logic/hybrid)
- [Web get started](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Web configuration / `inferenceSource`](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
- Contest: [firebasehybridaihackathon.devpost.com](https://firebasehybridaihackathon.devpost.com/)

## Repo layout

```
firebase-hybridcopilot/
  README.md                 ← this file (EN)
  BUILD-STATUS.md           ← done / fee watch / blockers
  IDEA.md                   ← concept anchor
  app/                      ← Vite + TypeScript web demo
    .env.example
    src/hybrid/             ← network probe, Firebase + mock clients
    src/prompts/            ← field-assistant prompts
    src/main.ts             ← EN UI
```

Public GitHub target (later): `er-s-an/hybridcopilot`.

## How to run

```bash
cd app
npm install
cp .env.example .env.local   # optional — empty = MOCK mode
npm run dev
```

Open the printed localhost URL in **Chrome ≥139** (on-device path).

### Mock mode (no Firebase keys)

Leave `VITE_FIREBASE_*` empty (or set `VITE_FORCE_MOCK=true`). The app still:

1. Probes network quality and picks a hybrid mode  
2. Simulates on-device download progress  
3. Returns a documented runnable answer with **mock_on_device** / **mock_in_cloud** source badges  

### Live Firebase AI Logic hybrid

1. Create a Firebase project → **AI Services → AI Logic** guided setup (Gemini Developer API is fine to start).  
2. Register a Web app; copy config into `app/.env.local`.  
3. Enforce App Check for AI Logic; register an **App Check debug token** for localhost (do not commit tokens).  
4. Chrome: enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, restart; optionally pre-download via `LanguageModel.create()`.  
5. Click **Run HybridCopilot** (user gesture required before `initializeDeviceModel()`).

```bash
cd app
npm run build    # typecheck + production bundle
npm run preview
```

## Demo script (judges / booth)

1. Show **Auto** mode on a strong network → expect cloud-leaning route + `in_cloud` (or mock_in_cloud).  
2. Force **PREFER_ON_DEVICE** / throttle network → expect on-device preference + source badge flip.  
3. Pick a demo chip (“Wi‑Fi just died…”) → show runnable talk track.  
4. Point at code: `src/hybrid/network.ts` + `src/hybrid/firebaseClient.ts` using `getGenerativeModel({ mode })` and `response.inferenceSource`.

## Blockers / human setup

- Firebase project + Web config + AI Logic APIs  
- App Check (debug token locally; production provider before public users)  
- Chrome on-device model download (minutes on first use)  
- **2026-11-09 Rules**: confirm no entry fee, submission assets, bonus challenges  

## License

Prototype for the hackathon; add a LICENSE before the public GitHub push if required by Rules.
