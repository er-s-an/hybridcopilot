import "./style.css";
import { InferenceMode } from "firebase/ai";
import { createHybridClient } from "./hybrid/client";
import type { AssistantAnswer, RouteDecision } from "./hybrid/types";
import { DEMO_INTENTS } from "./prompts/fieldAssistant";

const client = createHybridClient();

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: "auto", label: "Auto (network → hybrid mode)" },
  { value: InferenceMode.PREFER_ON_DEVICE, label: "PREFER_ON_DEVICE" },
  { value: InferenceMode.PREFER_IN_CLOUD, label: "PREFER_IN_CLOUD" },
  { value: InferenceMode.ONLY_ON_DEVICE, label: "ONLY_ON_DEVICE" },
  { value: InferenceMode.ONLY_IN_CLOUD, label: "ONLY_IN_CLOUD" },
];

function qualityClass(q: RouteDecision["quality"]): string {
  if (q === "strong") return "strong";
  if (q === "weak") return "weak";
  if (q === "offline") return "offline";
  return "";
}

function sourceBadge(source: AssistantAnswer["inferenceSource"]): { cls: string; label: string } {
  if (source === "on_device" || source === "mock_on_device") {
    return { cls: "source-on", label: `Source: ${source}` };
  }
  return { cls: "source-cloud", label: `Source: ${source}` };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="hero">
    <h1>HybridCopilot</h1>
    <p>
      Field assistant for booth demos when Wi‑Fi drops.
      <strong>Firebase AI Logic hybrid inference</strong> picks an
      <code>InferenceMode</code> from the network (on-device when the link is
      weak, cloud when it is strong) and labels each answer with
      <code>inferenceSource</code>.
    </p>
    <div class="badges" id="status-badges"></div>
  </header>

  <section class="panel">
    <h2>Ask</h2>
    <div class="controls">
      <div class="row">
        <label class="mode" for="mode">Inference mode</label>
        <select id="mode" aria-label="Inference mode">
          ${MODE_OPTIONS.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")}
        </select>
        <button type="button" class="ghost" id="probe">Re-probe network</button>
      </div>
      <div class="chips" id="chips"></div>
      <textarea id="intent" placeholder="Describe what you need on the booth floor…"></textarea>
      <div class="row">
        <button type="button" class="primary" id="ask">Run HybridCopilot</button>
        <span class="meta" id="progress-label"></span>
      </div>
      <div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>
    </div>
  </section>

  <section class="panel">
    <h2>Answer</h2>
    <div class="meta" id="answer-meta">Waiting for an intent…</div>
    <pre class="answer" id="answer"></pre>
  </section>

  <footer class="note">
    Contest: Firebase #BuildHybridAI 2026 · Devpost
    <code>er-s-an</code> · Do not submit until the owner says so.
    Docs:
    <a href="https://firebase.google.com/docs/ai-logic/hybrid/web/get-started" target="_blank" rel="noreferrer">hybrid Web get-started</a>.
    Missing Firebase keys use the mock provider. Routing and source badges still show.
  </footer>
`;

const statusBadges = app.querySelector<HTMLDivElement>("#status-badges")!;
const chips = app.querySelector<HTMLDivElement>("#chips")!;
const intentEl = app.querySelector<HTMLTextAreaElement>("#intent")!;
const modeEl = app.querySelector<HTMLSelectElement>("#mode")!;
const askBtn = app.querySelector<HTMLButtonElement>("#ask")!;
const probeBtn = app.querySelector<HTMLButtonElement>("#probe")!;
const answerEl = app.querySelector<HTMLPreElement>("#answer")!;
const answerMeta = app.querySelector<HTMLDivElement>("#answer-meta")!;
const progressBar = app.querySelector<HTMLSpanElement>("#progress-bar")!;
const progressLabel = app.querySelector<HTMLSpanElement>("#progress-label")!;

DEMO_INTENTS.forEach((text) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = text.length > 64 ? text.slice(0, 61) + "…" : text;
  b.title = text;
  b.addEventListener("click", () => {
    intentEl.value = text;
    intentEl.focus();
  });
  chips.appendChild(b);
});

function renderStatus(route: RouteDecision): void {
  const providerCls = client.kind === "mock" ? "mock" : "live";
  const providerLabel = client.kind === "mock" ? "Provider: MOCK" : "Provider: Firebase AI Logic";
  statusBadges.innerHTML = `
    <span class="badge ${providerCls}">${providerLabel}</span>
    <span class="badge ${qualityClass(route.quality)}">Network: ${route.quality}</span>
    <span class="badge">Auto mode → <code>${route.mode}</code></span>
    <span class="badge" title="${escapeHtml(route.reason)}">${escapeHtml(route.reason)}</span>
  `;
}

async function refreshProbe(): Promise<RouteDecision> {
  const route = await client.probeNetwork();
  renderStatus(route);
  return route;
}

function setProgress(fraction: number): void {
  const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = fraction > 0 && fraction < 1 ? `On-device model ${pct}%` : "";
}

async function runAsk(): Promise<void> {
  const intent = intentEl.value.trim();
  if (!intent) {
    answerMeta.textContent = "Enter an intent (or pick a demo chip).";
    return;
  }

  askBtn.disabled = true;
  setProgress(0);
  answerMeta.textContent = "Routing through Firebase AI Logic hybrid…";
  answerEl.textContent = "";

  try {
    const selected = modeEl.value;
    const forceMode =
      selected === "auto" ? undefined : (selected as (typeof InferenceMode)[keyof typeof InferenceMode]);

    const answer = await client.ask(intent, {
      forceMode,
      onDeviceProgress: setProgress,
    });

    renderStatus(answer.route);
    const src = sourceBadge(answer.inferenceSource);
    answerMeta.innerHTML = `
      <div class="badges">
        <span class="badge ${src.cls}">${src.label}</span>
        <span class="badge">Mode used: <code>${answer.modeUsed}</code></span>
        <span class="badge">${answer.latencyMs} ms</span>
        <span class="badge">${answer.provider}</span>
      </div>
    `;
    answerEl.textContent = answer.text;
    setProgress(1);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    answerMeta.innerHTML = `<span class="badge offline">Error</span>`;
    answerEl.textContent =
      `Hybrid request failed.\n\n${message}\n\n` +
      `Hints:\n` +
      `- For real Firebase path: set app/.env.local from Firebase Console (AI Logic + App Check debug token).\n` +
      `- On-device needs Chrome ≥139 + Prompt API flags; call initializeDeviceModel after a click.\n` +
      `- Mock mode works without keys: leave env empty or set VITE_FORCE_MOCK=true.`;
  } finally {
    askBtn.disabled = false;
  }
}

probeBtn.addEventListener("click", () => {
  void refreshProbe();
});
askBtn.addEventListener("click", () => {
  void runAsk();
});

void refreshProbe();
intentEl.value = DEMO_INTENTS[0];
