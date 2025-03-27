#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use axum::{debug_handler, Extension};
use loco_rs::prelude::*;

use crate::{models::users, sol::SonsOfLiberty};

use super::auth::CookieAuth;

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    Extension(_): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;
    tracing::info!("Peers not supported for nostr transport yet.");
    let peers: Vec<serde_json::Value> = vec![];
    // ddk
    //     .dlcdevkit
    //     .transport
    //     .peer_manager
    //     .list_peers()
    //     .iter()
    //     .map(|p| {
    //         let host = match &p.socket_address {
    //             Some(h) => h.to_string(),
    //             None => "".to_string(),
    //         };
    //         serde_json::json!({
    //             "pubkey": p.counterparty_node_id.to_string(),
    //             "host": host,
    //         })
    //     })
    //     .collect::<Vec<_>>();
    format::json(peers)
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/peers/").add("/", get(index))
}
