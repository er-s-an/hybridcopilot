import { createFirebaseClient, isForceMock, readFirebaseConfigFromEnv } from "./firebaseClient";
import { createMockClient } from "./mockProvider";
import type { HybridClient } from "./types";

/**
 * Prefer real Firebase AI Logic hybrid when web config is present;
 * otherwise documentable mock that still demonstrates routing + source badges.
 */
export function createHybridClient(): HybridClient {
  if (isForceMock()) return createMockClient();
  const config = readFirebaseConfigFromEnv();
  if (!config) return createMockClient();
  return createFirebaseClient(config);
}

export type { HybridClient, AssistantAnswer, RouteDecision, AskOptions } from "./types";
