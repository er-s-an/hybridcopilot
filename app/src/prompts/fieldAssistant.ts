/** System guidance for on-device Chrome Prompt API (initialPrompts). */
export const ON_DEVICE_SYSTEM = `You are HybridCopilot, a field assistant for demos and trade-shows with flaky Wi‑Fi.
Answer in clear English. Prefer short, runnable steps: checklists, commands, talking points.
If unsure, say what to verify on-site. No filler.`;

/** Prefixed into cloud prompts (cloud supports richer context). */
export const CLOUD_SYSTEM_PREFIX = `You are HybridCopilot — an intent→answer field copilot for booth staff and product demos.
Venue Wi‑Fi often drops. Produce actionable, runnable answers (steps, scripts, troubleshooting).
Be specific, English-only, and demo-ready.`;

export function buildCloudPrompt(intent: string): string {
  return `${CLOUD_SYSTEM_PREFIX}

User intent:
${intent}`;
}

export const DEMO_INTENTS = [
  "Wi‑Fi just died mid-demo — give me a 60-second talk track while we recover.",
  "Checklist: set up a Firebase AI Logic hybrid booth laptop in 10 minutes.",
  "Visitor asks how on-device vs cloud inference differs — explain in plain English.",
  "Generate a 3-bullet pitch for HybridCopilot for a judge walk-by.",
] as const;
