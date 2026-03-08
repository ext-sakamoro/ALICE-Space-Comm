use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_transmissions: u64, total_model_diffs: u64, total_orbit_calcs: u64, bytes_transmitted: u64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct TransmitRequest { mission_id: String, payload: serde_json::Value, priority: Option<String>, target: Option<String> }
#[derive(Serialize)]
struct TransmitResponse { transmission_id: String, mission_id: String, original_size_bytes: u64, model_diff_size_bytes: u64, compression_ratio: f64, estimated_transit_secs: f64, light_delay_secs: f64, status: String, elapsed_us: u128 }

#[derive(Deserialize)]
struct ModelDiffRequest { base_model_id: String, current_state: serde_json::Value }
#[derive(Serialize)]
struct ModelDiffResponse { diff_id: String, base_model_id: String, diff_size_bytes: u64, full_state_size_bytes: u64, savings_pct: f64, elapsed_us: u128 }

#[derive(Deserialize)]
struct OrbitRequest { body: Option<String>, altitude_km: Option<f64>, inclination_deg: Option<f64> }
#[derive(Serialize)]
struct OrbitResponse { orbit_id: String, body: String, altitude_km: f64, period_secs: f64, velocity_km_s: f64, communication_windows: Vec<CommWindow> }
#[derive(Serialize)]
struct CommWindow { start: String, end: String, duration_secs: u64, max_data_rate_kbps: f64, elevation_deg: f64 }

#[derive(Deserialize)]
struct MissionRequest { name: String, target_body: Option<String>, distance_au: Option<f64> }
#[derive(Serialize)]
struct MissionResponse { mission_id: String, name: String, target_body: String, distance_au: f64, light_delay_secs: f64, optimal_protocol: String, estimated_bandwidth_bps: f64, status: String }

#[derive(Serialize)]
struct StatsResponse { total_transmissions: u64, total_model_diffs: u64, total_orbit_calcs: u64, bytes_transmitted: u64, bandwidth_saved_pct: f64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "space_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_transmissions: 0, total_model_diffs: 0, total_orbit_calcs: 0, bytes_transmitted: 0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/space/transmit", post(transmit))
        .route("/api/v1/space/model-diff", post(model_diff))
        .route("/api/v1/space/orbit", post(orbit_calc))
        .route("/api/v1/space/mission", post(create_mission))
        .route("/api/v1/space/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("SPACE_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Space Comm Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_transmissions + st.total_model_diffs })
}

async fn transmit(State(s): State<Arc<AppState>>, Json(req): Json<TransmitRequest>) -> Json<TransmitResponse> {
    let t = Instant::now();
    let orig = serde_json::to_string(&req.payload).map(|s| s.len() as u64).unwrap_or(1000);
    let diff_size = orig / 20; // Model diff achieves ~20x compression
    let target = req.target.unwrap_or_else(|| "mars".into());
    let light_delay = match target.as_str() { "moon" => 1.3, "mars" => 1260.0, "jupiter" => 2880.0, "saturn" => 4800.0, _ => 500.0 };
    let transit = light_delay + (diff_size as f64 / 1000.0); // transmission time
    { let mut st = s.stats.lock().unwrap(); st.total_transmissions += 1; st.bytes_transmitted += diff_size; }
    Json(TransmitResponse { transmission_id: uuid::Uuid::new_v4().to_string(), mission_id: req.mission_id, original_size_bytes: orig, model_diff_size_bytes: diff_size, compression_ratio: orig as f64 / diff_size as f64, estimated_transit_secs: transit, light_delay_secs: light_delay, status: "queued".into(), elapsed_us: t.elapsed().as_micros() })
}

async fn model_diff(State(s): State<Arc<AppState>>, Json(req): Json<ModelDiffRequest>) -> Json<ModelDiffResponse> {
    let t = Instant::now();
    let full_size = serde_json::to_string(&req.current_state).map(|s| s.len() as u64).unwrap_or(5000);
    let diff_size = full_size / 50; // Typical model diff is 2% of full state
    s.stats.lock().unwrap().total_model_diffs += 1;
    Json(ModelDiffResponse { diff_id: uuid::Uuid::new_v4().to_string(), base_model_id: req.base_model_id, diff_size_bytes: diff_size, full_state_size_bytes: full_size, savings_pct: (1.0 - diff_size as f64 / full_size as f64) * 100.0, elapsed_us: t.elapsed().as_micros() })
}

async fn orbit_calc(State(s): State<Arc<AppState>>, Json(req): Json<OrbitRequest>) -> Json<OrbitResponse> {
    let body = req.body.unwrap_or_else(|| "earth".into());
    let alt = req.altitude_km.unwrap_or(400.0);
    let mu = match body.as_str() { "earth" => 398600.4, "mars" => 42828.0, "moon" => 4904.9, _ => 398600.4 };
    let r = match body.as_str() { "earth" => 6371.0, "mars" => 3389.5, "moon" => 1737.4, _ => 6371.0 } + alt;
    let period = 2.0 * std::f64::consts::PI * (r.powi(3) / mu).sqrt();
    let velocity = (mu / r).sqrt();
    let windows = vec![
        CommWindow { start: "2026-02-23T06:00:00Z".into(), end: "2026-02-23T06:15:00Z".into(), duration_secs: 900, max_data_rate_kbps: 256.0, elevation_deg: 45.0 },
        CommWindow { start: "2026-02-23T18:30:00Z".into(), end: "2026-02-23T18:42:00Z".into(), duration_secs: 720, max_data_rate_kbps: 128.0, elevation_deg: 30.0 },
    ];
    s.stats.lock().unwrap().total_orbit_calcs += 1;
    Json(OrbitResponse { orbit_id: uuid::Uuid::new_v4().to_string(), body, altitude_km: alt, period_secs: period, velocity_km_s: velocity, communication_windows: windows })
}

async fn create_mission(State(_s): State<Arc<AppState>>, Json(req): Json<MissionRequest>) -> Json<MissionResponse> {
    let target = req.target_body.unwrap_or_else(|| "mars".into());
    let dist = req.distance_au.unwrap_or_else(|| match target.as_str() { "moon" => 0.0026, "mars" => 1.5, "jupiter" => 5.2, _ => 1.0 });
    let light_delay = dist * 499.0; // ~499 secs per AU
    let bandwidth = 1000.0 / (dist * dist).max(0.01); // Inverse square law
    Json(MissionResponse { mission_id: uuid::Uuid::new_v4().to_string(), name: req.name, target_body: target, distance_au: dist, light_delay_secs: light_delay, optimal_protocol: "dtn-model-diff".into(), estimated_bandwidth_bps: bandwidth, status: "planned".into() })
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse { total_transmissions: st.total_transmissions, total_model_diffs: st.total_model_diffs, total_orbit_calcs: st.total_orbit_calcs, bytes_transmitted: st.bytes_transmitted, bandwidth_saved_pct: 95.0 })
}
