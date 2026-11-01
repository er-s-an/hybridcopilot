/** Mirrors src/hybrid/network.ts classify rules for CI-less smoke (no browser). */
const InferenceMode = {
  PREFER_ON_DEVICE: "prefer_on_device",
  ONLY_ON_DEVICE: "only_on_device",
  ONLY_IN_CLOUD: "only_in_cloud",
  PREFER_IN_CLOUD: "prefer_in_cloud",
};

function classify(online, conn = {}) {
  if (!online) {
    return { quality: "offline", mode: InferenceMode.ONLY_ON_DEVICE };
  }
  const effectiveType = (conn.effectiveType || "").toLowerCase();
  const rtt = conn.rtt;
  const downlink = conn.downlink;
  const saveData = Boolean(conn.saveData);
  const weakType = ["slow-2g", "2g", "3g"].includes(effectiveType);
  const weakRtt = typeof rtt === "number" && rtt >= 300;
  const weakDownlink = typeof downlink === "number" && downlink > 0 && downlink < 1.5;
  if (saveData || weakType || weakRtt || weakDownlink) {
    return { quality: "weak", mode: InferenceMode.PREFER_ON_DEVICE };
  }
  if (effectiveType === "4g" || (typeof downlink === "number" && downlink >= 5)) {
    return { quality: "strong", mode: InferenceMode.PREFER_IN_CLOUD };
  }
  return { quality: "unknown", mode: InferenceMode.PREFER_ON_DEVICE };
}

const cases = [
  [false, {}, "offline", "only_on_device"],
  [true, { effectiveType: "3g" }, "weak", "prefer_on_device"],
  [true, { effectiveType: "4g", downlink: 10 }, "strong", "prefer_in_cloud"],
  [true, { rtt: 450 }, "weak", "prefer_on_device"],
  [true, {}, "unknown", "prefer_on_device"],
];

let failed = 0;
for (const [online, conn, q, mode] of cases) {
  const got = classify(online, conn);
  const ok = got.quality === q && got.mode === mode;
  console.log(ok ? "OK" : "FAIL", { online, conn, got, expect: { q, mode } });
  if (!ok) failed++;
}
if (failed) {
  console.error(`smoke-network: ${failed} failed`);
  process.exit(1);
}
console.log("smoke-network: all passed");
