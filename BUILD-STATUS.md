# HybridCopilot — BUILD-STATUS

**Updated:** 2026-11-02 (Asia/Shanghai) · Pre-Build only · **NO Submit**

| Field | Status |
| --- | --- |
| Soft enroll | REGISTERED Devpost **er-s-an** · https://firebasehybridaihackathon.devpost.com/ |
| Idea | HybridCopilot — network-aware Firebase AI Logic hybrid field assistant |
| App scaffold | **DONE** (`app/` Vite+TS) — mock + live hybrid clients |
| EN README | **DONE** |
| Fee / Rules watch | **WATCH until ~2026-11-09** — Devpost does **not** list an entry fee yet; assume $0. **If Rules require a fee → STOP / DROP risk** |
| Submissions window | Open ~Nov 9 – close Nov 30, 2026 **14:00 PT** |
| Submit | **BLOCKED** until user 「交」 — do not submit |

## Done this pre-Build

- Hybrid routing: offline → `ONLY_ON_DEVICE`; weak → `PREFER_ON_DEVICE`; strong → `PREFER_IN_CLOUD`
- Firebase client: `getAI` + `GoogleAIBackend` + `getGenerativeModel({ mode })` + `initializeDeviceModel` + `inferenceSource`
- Mock provider when `VITE_FIREBASE_*` missing (documented badges `mock_on_device` / `mock_in_cloud`)
- EN UI + demo intent chips; `npm run build` + `npm run smoke:network` pass
- Docs: `README.md`, `IDEA.md`, `docs/FIREBASE-SETUP.md`, `docs/SOURCES.md`

## Blockers (need human / Caesar)

1. **Firebase project** + Web app config → `app/.env.local`
2. **AI Logic** console setup + **App Check** debug token for localhost
3. Chrome ≥139 + Prompt API flag + optional on-device model download
4. **2026-11-09 Rules** alignment: fee, submission media, judging extras, bonus challenges
5. Later: create public repo `er-s-an/hybridcopilot` and push (not done here)

## Next steps (→ 11-09)

1. Re-read Devpost Rules day-of; **abort if fee**
2. Wire live Firebase keys; record a short hybrid badge demo (weak vs strong)
3. Align README / video / Devpost fields with published criteria
4. Only Submit after 「交」

## Paths

- Workspace: `/workspace/competitions/firebase-hybridcopilot/`
- App: `/workspace/competitions/firebase-hybridcopilot/app/`

## Public repo

https://github.com/er-s-an/hybridcopilot (`main`)
