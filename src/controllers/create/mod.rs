use axum::routing::post;
use loco_rs::prelude::Routes;

pub mod enumeration;
pub mod parlay;

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/create/")
        .add("/enum", post(enumeration::enum_create))
        .add("/parlay", post(parlay::create_parlay_event))
}
