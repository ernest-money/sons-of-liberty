#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use crate::{ddk::SonsOfLiberty, models::users};
use axum::{debug_handler, http::StatusCode, Extension};
use loco_rs::{controller::ErrorDetail, prelude::*};
use std::sync::Arc;

#[debug_handler]
pub async fn index(
    auth: auth::JWT,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let balance = ddk.dlcdevkit.balance().map_err(|e| {
        Error::CustomError(
            StatusCode::NOT_FOUND,
            ErrorDetail::with_reason(e.to_string()),
        )
    })?;
    format::json(balance)
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/balance/").add("/", get(index))
}
