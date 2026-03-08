export default function LandingPage() {
  const features = [
    {
      title: "Delay-Tolerant Messaging",
      description:
        "Store-and-forward DTN protocol with Reed-Solomon FEC for deep-space links with latencies up to 24 minutes.",
    },
    {
      title: "Orbital Mechanics Engine",
      description:
        "High-fidelity Keplerian orbit propagation with J2 perturbations, maneuver planning, and conjunction analysis.",
    },
    {
      title: "Mission Control API",
      description:
        "Schedule and monitor multi-phase missions across spacecraft fleets with real-time telemetry ingestion.",
    },
    {
      title: "Signal Model Diffing",
      description:
        "Compare link-budget models across spacecraft generations to quantify SNR, EIRP, and data-rate deltas.",
    },
    {
      title: "Real-Time Statistics",
      description:
        "Per-mission throughput, retransmit rates, contact windows, and error budgets on a unified dashboard.",
    },
    {
      title: "Cloud-Native Scale",
      description:
        "Stateless gateway scales horizontally. Persistent telemetry stored in time-series DB with multi-region replication.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a, #0d1b2a)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ffffff10",
        }}
      >
        <h2 style={{ margin: 0, color: "#00d4ff" }}>ALICE Space-Comm</h2>
        <a href="/dashboard/console" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 600 }}>
          Console →
        </a>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "#00d4ff20",
            color: "#00d4ff",
            borderRadius: 20,
            padding: "4px 16px",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          DEEP-SPACE COMMUNICATION SAAS
        </div>

        <h1 style={{ fontSize: 48, marginBottom: 16, lineHeight: 1.1 }}>
          Mission-Critical Comms
          <br />
          <span style={{ color: "#00d4ff" }}>Beyond Earth Orbit</span>
        </h1>

        <p style={{ fontSize: 20, color: "#aaa", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          Delay-tolerant messaging, orbital mechanics, and mission planning for deep-space operations — delivered as a cloud API.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 80 }}>
          <a
            href="/dashboard/console"
            style={{
              background: "#00d4ff",
              color: "#000",
              padding: "14px 32px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open Console
          </a>
          <a
            href="#features"
            style={{
              background: "#ffffff10",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Learn More
          </a>
        </div>

        <div
          id="features"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            textAlign: "left",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#ffffff08",
                borderRadius: 12,
                padding: 24,
                border: "1px solid #ffffff10",
              }}
            >
              <h3 style={{ margin: "0 0 12px", color: "#00d4ff", fontSize: 16 }}>{f.title}</h3>
              <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6, fontSize: 14 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "32px", borderTop: "1px solid #ffffff10", color: "#444", fontSize: 12 }}>
        ALICE Space-Comm · AGPL-3.0-or-later · Project A.L.I.C.E.
      </footer>
    </div>
  );
}
