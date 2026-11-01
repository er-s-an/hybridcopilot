import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
  type GenerativeModel,
} from "firebase/ai";
import { buildCloudPrompt, ON_DEVICE_SYSTEM } from "../prompts/fieldAssistant";
import { probeNetwork } from "./network";
import type { AskOptions, AssistantAnswer, HybridClient } from "./types";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function readFirebaseConfigFromEnv(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

  if (!apiKey || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket || `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId || "0",
    appId,
  };
}

export function isForceMock(): boolean {
  return String(import.meta.env.VITE_FORCE_MOCK || "").toLowerCase() === "true";
}

function createModel(ai: ReturnType<typeof getAI>, mode: InferenceMode): GenerativeModel {
  return getGenerativeModel(ai, {
    mode,
    inCloudParams: {
      // Override default when you want a specific cloud model for demos.
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.6,
      },
    },
    onDeviceParams: {
      createOptions: {
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [
          {
            role: "system",
            content: [{ type: "text", value: ON_DEVICE_SYSTEM }],
          },
        ],
      },
    },
  });
}

export function createFirebaseClient(config: FirebaseWebConfig): HybridClient {
  const app: FirebaseApp = initializeApp(config);
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const modelCache = new Map<InferenceMode, GenerativeModel>();
  let deviceInitStarted = false;

  function modelFor(mode: InferenceMode): GenerativeModel {
    let model = modelCache.get(mode);
    if (!model) {
      model = createModel(ai, mode);
      modelCache.set(mode, model);
    }
    return model;
  }

  return {
    kind: "firebase",
    async probeNetwork() {
      return probeNetwork();
    },
    async ask(intent: string, options: AskOptions = {}): Promise<AssistantAnswer> {
      const route = await probeNetwork();
      const mode = options.forceMode ?? route.mode;
      const model = modelFor(mode);

      // Required by Firebase AI Logic hybrid Web SDK: user-gesture → initializeDeviceModel.
      if (!deviceInitStarted && mode !== InferenceMode.ONLY_IN_CLOUD) {
        deviceInitStarted = true;
        void model.initializeDeviceModel((progress) => {
          options.onDeviceProgress?.(progress);
        });
      } else if (options.onDeviceProgress) {
        options.onDeviceProgress(1);
      }

      const started = performance.now();
      const prompt =
        mode === InferenceMode.ONLY_ON_DEVICE || mode === InferenceMode.PREFER_ON_DEVICE
          ? intent
          : buildCloudPrompt(intent);

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const inferenceSource = result.response.inferenceSource ?? "in_cloud";

      return {
        text,
        inferenceSource,
        modeUsed: mode,
        latencyMs: Math.round(performance.now() - started),
        provider: "firebase",
        route,
      };
    },
  };
}
