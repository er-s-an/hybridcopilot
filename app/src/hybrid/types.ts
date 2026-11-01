import type { InferenceMode, InferenceSource } from "firebase/ai";

/** Coarse network quality used to pick a Firebase AI Logic hybrid mode. */
export type NetworkQuality = "offline" | "weak" | "strong" | "unknown";

export type RouteDecision = {
  quality: NetworkQuality;
  mode: InferenceMode;
  reason: string;
  measuredAt: number;
  online: boolean;
  effectiveType?: string;
  rttMs?: number;
  downlinkMbps?: number;
};

export type AssistantAnswer = {
  text: string;
  inferenceSource: InferenceSource | "mock_on_device" | "mock_in_cloud";
  modeUsed: InferenceMode;
  latencyMs: number;
  provider: "firebase" | "mock";
  route: RouteDecision;
};

export type AskOptions = {
  /** Override auto network routing (useful for booth demos). */
  forceMode?: InferenceMode;
  onDeviceProgress?: (fraction: number) => void;
};

export type HybridClient = {
  readonly kind: "firebase" | "mock";
  ask(intent: string, options?: AskOptions): Promise<AssistantAnswer>;
  probeNetwork(): Promise<RouteDecision>;
};
