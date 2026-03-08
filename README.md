# ALICE Space-Comm

Deep-space communication SaaS with delay-tolerant messaging, orbit calculation, and mission planning.

## Architecture

```
Frontend (Next.js 15)       API Gateway (port 8081)
  /dashboard/console   →    POST /api/v1/space/transmit
  /                         POST /api/v1/space/model-diff
                            POST /api/v1/space/orbit
                            POST /api/v1/space/mission
                            GET  /api/v1/stats
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             DTN Engine    Orbit Engine  Mission Planner
          (store-forward)  (Keplerian)   (scheduling)
                    │
             Time-Series DB (telemetry)
```

## Features

| Feature | Description |
|---------|-------------|
| Delay-Tolerant Messaging | Store-and-forward DTN with Reed-Solomon FEC |
| Orbital Mechanics | Keplerian propagation with J2 perturbations |
| Mission Planning | Multi-phase mission scheduling and monitoring |
| Signal Model Diffing | Compare link-budget models across spacecraft |
| Real-Time Statistics | Throughput, retransmit rates, contact windows |
| Cloud-Native Scale | Stateless gateway with horizontal scaling |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/v1/stats | System-wide statistics |
| POST | /api/v1/space/transmit | Transmit a message to a destination |
| POST | /api/v1/space/model-diff | Diff two signal propagation models |
| POST | /api/v1/space/orbit | Compute/store an orbital trajectory |
| POST | /api/v1/space/mission | Create or update a mission plan |

### POST /api/v1/space/transmit

```json
{
  "mission_id": "ALICE-DEEP-001",
  "destination": "Mars",
  "payload": "Hello from Earth",
  "priority": "high",
  "encoding": "reed-solomon",
  "delay_tolerant": true
}
```

### POST /api/v1/space/orbit

```json
{
  "body": "Mars",
  "semi_major_axis_km": 227936640,
  "eccentricity": 0.0934,
  "inclination_deg": 1.85,
  "epoch": "2026-01-01T00:00:00Z"
}
```

### POST /api/v1/space/mission

```json
{
  "name": "Mars Relay Alpha",
  "launch_window": "2026-07-15T06:00:00Z",
  "spacecraft": "ALICE-Relay-3",
  "objectives": ["orbit-insertion", "data-relay", "atmospheric-sensing"]
}
```

## Quick Start

```bash
docker compose up -d
# API:      http://localhost:8081
# Frontend: http://localhost:3000
```

## License

AGPL-3.0-or-later
