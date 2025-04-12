#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use super::auth::CookieAuth;
use crate::{common::nostr::TradeCounterpartyError, models::users, sol::SonsOfLiberty};
use axum::extract::Query;
use axum::http::StatusCode;
use axum::{debug_handler, Extension};
use bitcoin::secp256k1::PublicKey as BitcoinPublicKey;
use loco_rs::controller::ErrorDetail;
use loco_rs::prelude::*;
use nostr::key::PublicKey;
use serde::Deserialize;
use std::str::FromStr;
use std::sync::Arc;

fn nostr_err_to_http(e: TradeCounterpartyError) -> Error {
    Error::CustomError(
        StatusCode::BAD_REQUEST,
        ErrorDetail {
            error: Some(e.to_string()),
            description: Some("Error getting trade counterparties".to_string()),
        },
    )
}

#[derive(Debug, Deserialize)]
pub struct CounterpartyParams {
    pub pubkey: Option<String>,
    pub nostr_key: Option<bool>,
}

#[debug_handler]
pub async fn contract_counterparties(
    cookie: CookieAuth,
    State(ctx): State<AppContext>,
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    Query(query): Query<CounterpartyParams>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    if let Some(pubkey) = query.pubkey {
        let nostr_pubkey = {
            if !query.nostr_key.unwrap_or(true) {
                let bitcoin_pubkey = BitcoinPublicKey::from_str(&pubkey).unwrap();
                ddk::nostr::bitcoin_to_nostr_pubkey(&bitcoin_pubkey)
            } else {
                PublicKey::from_str(&pubkey).unwrap()
            }
        };
        let counterparty = sol
            .nostr
            .get_trade_counterparty(nostr_pubkey)
            .await
            .map_err(nostr_err_to_http)?;
        return format::json(counterparty);
    }

    let counterparties = sol
        .nostr
        .get_trade_counterparties()
        .await
        .map_err(nostr_err_to_http)?;
    format::json(counterparties)
}

#[derive(Debug, Deserialize)]
pub struct CreateProfileParams {
    pub name: String,
    pub about: String,
}

#[debug_handler]
pub async fn create_profile(
    cookie: CookieAuth,
    State(ctx): State<AppContext>,
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    Json(profile): Json<CreateProfileParams>,
) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let (profile, event) = sol
        .nostr
        .create_or_update_dlc_profile(profile.name, profile.about)
        .await
        .map_err(nostr_err_to_http)?;

    // update db profile to have nostr profile id
    user.into_active_model()
        .update_nostr_profile(&ctx.db, &event.id.to_string())
        .await?;

    format::json(profile)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/nostr/")
        .add("/counterparties", get(contract_counterparties))
        .add("/create-profile", post(create_profile))
}
