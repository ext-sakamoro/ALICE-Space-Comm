"use client";
import { useState } from "react";

type Tab = "transmit" | "model-diff" | "orbit" | "mission" | "stats";

const DEFAULTS: Record<Tab, string> = {
  transmit: JSON.stringify(
    {
      mission_id: "ALICE-DEEP-001",
      destination: "Mars",
      payload: "Hello from Earth",
      priority: "high",
      encoding: "reed-solomon",
      delay_tolerant: true,
    },
    null,
    2
  ),
  "model-diff": JSON.stringify(
    {
      model_a: "deep-space-v1",
      model_b: "deep-space-v2",
      metric: "signal_loss_db",
    },
    null,
    2
  ),
  orbit: JSON.stringify(
    {
      body: "Mars",
      semi_major_axis_km: 227936640,
      eccentricity: 0.0934,
      inclination_deg: 1.85,
      epoch: "2026-01-01T00:00:00Z",
    },
    null,
    2
  ),
  mission: JSON.stringify(
    {
      name: "Mars Relay Alpha",
      launch_window: "2026-07-15T06:00:00Z",
      spacecraft: "ALICE-Relay-3",
      objectives: ["orbit-insertion", "data-relay", "atmospheric-sensing"],
    },
    null,
    2
  ),
  stats: JSON.stringify({}, null, 2),
};

const ENDPOINTS: Record<Tab, { method: string; path: string }> = {
  transmit: { method: "POST", path: "/api/v1/space/transmit" },
  "model-diff": { method: "POST", path: "/api/v1/space/model-diff" },
  orbit: { method: "POST", path: "/api/v1/space/orbit" },
  mission: { method: "POST", path: "/api/v1/space/mission" },
  stats: { method: "GET", path: "/api/v1/stats" },
};

const TAB_LABELS: Record<Tab, string> = {
  transmit: "Transmit",
  "model-diff": "Model Diff",
  orbit: "Orbit",
  mission: "Mission",
  stats: "Stats",
};

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState<Tab>("transmit");
  const [inputs, setInputs] = useState<Record<Tab, string>>(DEFAULTS);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8081";

  const send = async () => {
    setLoading(true);
    setResponse("");
    const { method, path } = ENDPOINTS[activeTab];
    try {
      const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
      if (method === "POST") opts.body = inputs[activeTab];
      const res = await fetch(`${API}${path}`, opts);
      setResponse(JSON.stringify(await res.json(), null, 2));
    } catch (e: unknown) {
      setResponse(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setLoading(false);
  };

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "monospace",
    fontWeight: activeTab === tab ? 700 : 400,
    background: activeTab === tab ? "#00d4ff" : "#1a1a2e",
    color: activeTab === tab ? "#000" : "#aaa",
  });

  return (
    <div style={{ padding: 24, fontFamily: "monospace", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ color: "#00d4ff", marginBottom: 8 }}>ALICE Space-Comm — Console</h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
        Deep-space communication SaaS · API: {API}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
        {ENDPOINTS[activeTab].method} {ENDPOINTS[activeTab].path}
      </div>

      <textarea
        value={inputs[activeTab]}
        onChange={(e) => setInputs((prev) => ({ ...prev, [activeTab]: e.target.value }))}
        rows={12}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: 13,
          background: "#111",
          color: "#e0e0e0",
          border: "1px solid #333",
          borderRadius: 6,
          padding: 12,
          boxSizing: "border-box",
        }}
        placeholder={ENDPOINTS[activeTab].method === "GET" ? "// GET request — no body needed" : "// JSON payload"}
      />

      <button
        onClick={send}
        disabled={loading}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: loading ? "#333" : "#00d4ff",
          color: loading ? "#666" : "#000",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          marginTop: 16,
          minHeight: 200,
          overflow: "auto",
          borderRadius: 6,
          border: "1px solid #1a3a1a",
          fontSize: 13,
        }}
      >
        {response || "// Response will appear here"}
      </pre>
    </div>
  );
}
