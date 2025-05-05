#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use crate::{models::users, sol::SonsOfLiberty};
use axum::http::StatusCode;
use axum::{debug_handler, Extension};
use loco_rs::controller::ErrorDetail;
use loco_rs::prelude::*;

use super::auth::CookieAuth;

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    State(ctx): State<AppContext>,
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;
    tracing::info!("Syncing manager and wallet.");
    if let Err(e) = sol.dlcdevkit.manager.periodic_check(false).await {
        tracing::error!("Error syncing manager: {:?}", e);
        return Err(Error::CustomError(
            StatusCode::INTERNAL_SERVER_ERROR,
            ErrorDetail::with_reason(e.to_string()),
        ));
    };

    if let Err(e) = sol.dlcdevkit.wallet.sync().await {
        tracing::error!("Error syncing wallet: {:?}", e);
        return Err(Error::CustomError(
            StatusCode::INTERNAL_SERVER_ERROR,
            ErrorDetail::with_reason(e.to_string()),
        ));
    };
    format::json(serde_json::json!({
        "success": true,
    }))
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/sync/").add("/", get(index))
}
