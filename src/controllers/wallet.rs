#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use axum::{debug_handler, http::StatusCode, Extension};
use loco_rs::{controller::ErrorDetail, prelude::*};

use crate::{models::users, sol::SonsOfLiberty};

#[debug_handler]
pub async fn index(
    auth: auth::JWT,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let address = ddk
        .dlcdevkit
        .wallet
        .new_external_address()
        .map_err(wallet_error_to_http_error)?;
    format::json(serde_json::json!({ "address": address.address }))
}

#[debug_handler]
pub async fn get_transactions(
    auth: auth::JWT,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let transactions = ddk
        .dlcdevkit
        .wallet
        .get_transactions()
        .map_err(wallet_error_to_http_error)?;
    format::json(transactions)
}

#[debug_handler]
pub async fn get_utxos(
    auth: auth::JWT,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let utxos = ddk
        .dlcdevkit
        .wallet
        .list_utxos()
        .map_err(wallet_error_to_http_error)?;
    format::json(utxos)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/wallet/")
        .add("/address", post(index))
        .add("/transactions", get(get_transactions))
        .add("/utxos", get(get_utxos))
}

fn wallet_error_to_http_error(e: ddk::error::WalletError) -> Error {
    Error::CustomError(
        StatusCode::BAD_REQUEST,
        ErrorDetail::with_reason(e.to_string()),
    )
}

// new address
// get transactions
// get utxos
