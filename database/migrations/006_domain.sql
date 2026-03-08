-- ALICE Space Comm: Domain-specific tables
CREATE TABLE IF NOT EXISTS transmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    mission_id UUID,
    protocol TEXT NOT NULL DEFAULT 'dtn' CHECK (protocol IN ('dtn', 'ccsds', 'model-diff', 'raw')),
    payload_bytes BIGINT NOT NULL DEFAULT 0,
    compressed_bytes BIGINT NOT NULL DEFAULT 0,
    compression_ratio DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    light_delay_sec DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    bit_error_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'transmitted' CHECK (status IN ('queued', 'transmitting', 'transmitted', 'received', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    target_body TEXT NOT NULL DEFAULT 'Mars',
    distance_au DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    max_light_delay_sec DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    bandwidth_kbps DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'lost-signal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    epoch TIMESTAMPTZ NOT NULL,
    semi_major_axis_km DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    eccentricity DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    inclination_deg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    raan_deg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    arg_periapsis_deg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    true_anomaly_deg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    period_hours DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transmissions_user ON transmissions(user_id, created_at);
CREATE INDEX idx_transmissions_mission ON transmissions(mission_id);
CREATE INDEX idx_missions_user ON missions(user_id);
CREATE INDEX idx_orbit_calculations_mission ON orbit_calculations(mission_id, epoch);
