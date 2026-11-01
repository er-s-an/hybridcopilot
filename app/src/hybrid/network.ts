import { InferenceMode } from "firebase/ai";
import type { NetworkQuality, RouteDecision } from "./types";

type NetworkInformationLike = {
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  saveData?: boolean;
};

function readConnection(): NetworkInformationLike | undefined {
  const nav = navigator as Navigator & { connection?: NetworkInformationLike };
  return nav.connection;
}

/**
 * Classify link quality for field / trade-show demos.
 * Weak Wi‑Fi → prefer on-device; strong link → prefer cloud (same Firebase AI Logic stack).
 */
export function classifyNetwork(online: boolean, conn?: NetworkInformationLike): {
  quality: NetworkQuality;
  mode: InferenceMode;
  reason: string;
} {
  if (!online) {
    return {
      quality: "offline",
      mode: InferenceMode.ONLY_ON_DEVICE,
      reason: "Browser reports offline — Firebase AI Logic ONLY_ON_DEVICE.",
    };
  }

  const effectiveType = (conn?.effectiveType || "").toLowerCase();
  const rtt = typeof conn?.rtt === "number" ? conn.rtt : undefined;
  const downlink = typeof conn?.downlink === "number" ? conn.downlink : undefined;
  const saveData = Boolean(conn?.saveData);

  const weakType = ["slow-2g", "2g", "3g"].includes(effectiveType);
  const weakRtt = typeof rtt === "number" && rtt >= 300;
  const weakDownlink = typeof downlink === "number" && downlink > 0 && downlink < 1.5;

  if (saveData || weakType || weakRtt || weakDownlink) {
    return {
      quality: "weak",
      mode: InferenceMode.PREFER_ON_DEVICE,
      reason:
        "Weak / metered network — PREFER_ON_DEVICE (Chrome Gemini Nano when ready, cloud fallback).",
    };
  }

  if (effectiveType === "4g" || (typeof downlink === "number" && downlink >= 5)) {
    return {
      quality: "strong",
      mode: InferenceMode.PREFER_IN_CLOUD,
      reason:
        "Strong network — PREFER_IN_CLOUD for richer answers, on-device fallback if cloud fails.",
    };
  }

  // Unknown connection API (Safari etc.): default to on-device preference for flaky booths.
  return {
    quality: "unknown",
    mode: InferenceMode.PREFER_ON_DEVICE,
    reason:
      "Network hints unavailable — default PREFER_ON_DEVICE for unreliable venue Wi‑Fi.",
  };
}

export async function probeNetwork(): Promise<RouteDecision> {
  const online = navigator.onLine;
  const conn = readConnection();
  const classified = classifyNetwork(online, conn);

  return {
    ...classified,
    measuredAt: Date.now(),
    online,
    effectiveType: conn?.effectiveType,
    rttMs: conn?.rtt,
    downlinkMbps: conn?.downlink,
  };
}
