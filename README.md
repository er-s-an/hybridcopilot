# HybridCopilot

**Firebase #BuildHybridAI 2026** pre-build. A booth field assistant on **Firebase AI Logic hybrid inference**: the client selects an `InferenceMode`, then shows `inferenceSource` for the path that actually answered. On-device and cloud share one stack. This is not a cloud-only copilot.

> Soft registration: Devpost user **er-s-an** (Caesar).  
> **Do not Submit** until the owner gives an explicit go-ahead. Full rules and any fee are expected around **2026-11-09**. If an entry fee appears, treat the project as a **DROP** risk.

## Problem

Booth and field demos fail when venue Wi‑Fi drops. A cloud-only copilot stalls with no link. An on-device-only copilot fails on browsers or devices that cannot run Gemini Nano. Staff need one short intent turned into a runnable answer (checklist, talk track, or troubleshooting steps) that still works on a weak link and on a strong one.

## Hybrid design

Same **Firebase AI Logic** client. Routing picks an official hybrid `InferenceMode`. After the call, `response.inferenceSource` (`on_device` or `in_cloud`) records where inference ran. The mode is the preference. The source is the proof. Judges should see both, not a cloud call with a local label.

| Network quality | InferenceMode | Behavior |
| --- | --- | --- |
| Offline | `ONLY_ON_DEVICE` | Chrome Prompt API / Gemini Nano only |
| Weak or metered (2g–3g, high RTT, save-data) | `PREFER_ON_DEVICE` | On-device first; cloud fallback |
| Strong (4g or good downlink) | `PREFER_IN_CLOUD` | Cloud first for a richer answer; on-device if cloud is unavailable |
| Unknown hints | `PREFER_ON_DEVICE` | Safe default for unreliable venues |

The UI badge shows **`inferenceSource`**: live values `on_device` and `in_cloud`, or mock values `mock_on_device` and `mock_in_cloud`. `PREFER_*` modes may fall back, so the badge can differ from the mode name. That difference is the hybrid behavior.

Call path: `src/hybrid/network.ts` chooses the mode. `src/hybrid/firebaseClient.ts` calls `getGenerativeModel({ mode })` and reads `response.inferenceSource`.

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

Public GitHub: https://github.com/er-s-an/hybridcopilot

## Public demo

- Live mock landing: https://hybridcopilot.vercel.app
- Mock mode (no Firebase keys) still shows `InferenceMode` routing and `inferenceSource` badges (`mock_on_device` / `mock_in_cloud`).

## How to run

```bash
cd app
npm install
cp .env.example .env.local   # optional — empty = MOCK mode
npm run dev
```

Open the printed localhost URL in **Chrome 139 or newer** (required for the on-device path).

### Mock vs live

#### Mock mode (no Firebase keys)

Leave `VITE_FIREBASE_*` empty, or set `VITE_FORCE_MOCK=true`. The app still:

1. Probes network quality and picks a hybrid `InferenceMode`
2. Simulates on-device download progress
3. Returns a documented runnable answer badged **mock_on_device** or **mock_in_cloud**

Mock uses the same mode table as live. It does not call Firebase.

#### Live Firebase AI Logic hybrid

1. Create a Firebase project, then open **AI Services → AI Logic** guided setup (Gemini Developer API is enough to start).
2. Register a Web app and copy its config into `app/.env.local`.
3. Enforce App Check for AI Logic. Register an **App Check debug token** for localhost. Do not commit tokens.
4. In Chrome, enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` and restart. Optionally pre-download with `LanguageModel.create()`.
5. Click **Run HybridCopilot**. A user gesture is required before `initializeDeviceModel()`.

Live answers use the same `InferenceMode` selection. The badge reads `response.inferenceSource` (`on_device` or `in_cloud`).

```bash
cd app
npm run build    # typecheck + production bundle
npm run preview
```

## Demo script (judges / booth)

1. Leave mode on **Auto** with a strong network. Expect a cloud-leaning route and badge `in_cloud` (or `mock_in_cloud`).
2. Force **PREFER_ON_DEVICE**, or throttle the network. Expect an on-device preference and the source badge to flip.
3. Pick a demo chip (“Wi‑Fi just died…”). Show the runnable talk track.
4. Point at `src/hybrid/network.ts` and `src/hybrid/firebaseClient.ts`: `getGenerativeModel({ mode })` and `response.inferenceSource`.

## Blockers / human setup

- Firebase project, Web config, and AI Logic APIs
- App Check (debug token locally; a production provider before public users)
- Chrome on-device model download (minutes on first use)
- **2026-11-09 rules**: confirm there is no entry fee, and confirm submission assets and bonus challenges

## License

Prototype for the hackathon. Add a LICENSE before the public GitHub push if the rules require one.
