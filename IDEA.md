# HybridCopilot — concept anchor

- **Who:** Booth / field staff running product demos where Wi‑Fi is unreliable.
- **Trigger:** They need a fast, actionable answer (talk track, checklist, recovery steps) mid-demo.
- **Mechanism:** Firebase AI Logic **hybrid inference** with network-aware mode selection (`PREFER_ON_DEVICE` vs `PREFER_IN_CLOUD` vs offline `ONLY_ON_DEVICE`), same SDK; surface `inferenceSource`.
- **Result:** Intent → runnable English answer; feature keeps working when the venue network drops.
- **Why this form:** Web Chrome demo is agent-buildable, shows hybrid badges clearly, and matches official Web hybrid docs (on-device via Prompt API + cloud Gemini).
- **Open until Rules (≈2026-11-09):** fee, exact submission media, bonus challenges, whether Android/Apple clients earn extra credit.
