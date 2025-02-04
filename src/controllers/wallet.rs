#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use axum::{debug_handler, Extension};
use loco_rs::prelude::*;

use crate::{common::dlcdevkit, models::users, sol::SonsOfLiberty};

use super::auth::CookieAuth;

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;
    let address = dlcdevkit::get_new_addresses(ddk)?;
    format::json(serde_json::json!({ "address": address }))
}

#[debug_handler]
pub async fn get_wallet_transactions(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;
    let transactions = dlcdevkit::get_transactions(ddk)?;
    format::json(transactions)
}

#[debug_handler]
pub async fn get_utxos(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;
    let utxos = dlcdevkit::get_utxos(ddk)?;
    format::json(utxos)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/wallet/")
        .add("/address", post(index))
        .add("/transactions", get(get_wallet_transactions))
        .add("/utxos", get(get_utxos))
}
