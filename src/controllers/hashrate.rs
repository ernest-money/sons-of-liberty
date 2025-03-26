#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use axum::{debug_handler, Extension};
use loco_rs::prelude::*;

use crate::common::market::Market;

#[debug_handler]
pub async fn index(
    Extension(market): Extension<Arc<Market>>,
    State(_ctx): State<AppContext>,
) -> Result<Response> {
    let stats = market.get_hashrate_stats().await?;
    tracing::info!("Hashrate stats");
    format::json(stats)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/market/hashrates/")
        .add("/", get(index))
}
