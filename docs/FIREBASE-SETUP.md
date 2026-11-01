# Firebase setup (human) — HybridCopilot live path

Required before real on-device / cloud hybrid calls (mock works without this).

1. **Firebase Console** → create/select project.  
2. **AI Services → AI Logic** → Get started → Gemini Developer API (no billing required to start).  
3. Register a **Web** app; copy config into `app/.env.local` (see `app/.env.example`).  
4. **App Check**: AI Logic setup enforces App Check. For localhost, enable debug provider and safelist the token from DevTools (never commit the token).  
5. Chrome ≥139: enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, restart; optionally `await LanguageModel.create()` to pre-download.  
6. Rebuild / restart Vite so `VITE_*` vars are picked up: `npm run dev`.

Official: https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
