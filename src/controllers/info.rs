#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use axum::{debug_handler, http::StatusCode, Extension};
use ddk::Transport;
use loco_rs::{controller::ErrorDetail, prelude::*};

use crate::{models::users, sol::SonsOfLiberty};

use super::auth::CookieAuth;

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;
    let transport_public_key = ddk.dlcdevkit.transport.public_key();
    let transport_type = ddk.dlcdevkit.transport.name();
    let oracle_public_key = ddk.dlcdevkit.oracle.get_pubkey().await.map_err(|e| {
        Error::CustomError(
            StatusCode::INTERNAL_SERVER_ERROR,
            ErrorDetail::with_reason(e.to_string()),
        )
    })?;
    format::json(serde_json::json!({
        "transport_public_key": transport_public_key,
        "transport_type": transport_type,
        "oracle_public_key": oracle_public_key,
    }))
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/info/").add("/", get(index))
}
