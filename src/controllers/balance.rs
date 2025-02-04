#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use crate::{common::dlcdevkit, models::users, sol::SonsOfLiberty};
use axum::{debug_handler, Extension};
use loco_rs::prelude::*;
use std::sync::Arc;

use super::auth::CookieAuth;

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let balance = dlcdevkit::get_balance(ddk)?;
    format::json(balance)
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/balance/").add("/", get(index))
}
