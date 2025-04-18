#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::{str::FromStr, sync::Arc};

use crate::{common::dlcdevkit, models::users, sol::SonsOfLiberty};
use axum::{debug_handler, extract::Query, http::StatusCode, Extension};
use bitcoin::secp256k1::PublicKey;
use ddk_manager::contract::contract_input::ContractInput;
use dlc_messages::{oracle_msgs::OracleAnnouncement, AcceptDlc};
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde::{Deserialize, Serialize};

use super::auth::CookieAuth;

#[derive(Debug, Deserialize)]
pub struct GetOfferByIdQuery {
    id: Option<String>,
}

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    Query(query): Query<GetOfferByIdQuery>,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let offers = dlcdevkit::get_offers(ddk.dlcdevkit.storage.clone()).await?;

    if let Some(id) = query.id {
        let offer = offers
            .iter()
            .find(|offer| offer.id == id)
            .ok_or(Error::CustomError(
                StatusCode::NOT_FOUND,
                ErrorDetail::with_reason("Offer not found"),
            ))?;
        format::json(offer)
    } else {
        format::json(offers)
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SendOfferBody {
    contract_input: ContractInput,
    counter_party: String,
    oracle_announcements: Vec<OracleAnnouncement>,
}

#[debug_handler]
pub async fn send_offer(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
    Json(body): Json<SendOfferBody>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let counter_party = PublicKey::from_str(&body.counter_party).map_err(|_| {
        Error::CustomError(
            StatusCode::BAD_REQUEST,
            ErrorDetail::with_reason("Public key is invalid"),
        )
    })?;

    let offer = ddk
        .dlcdevkit
        .send_dlc_offer(
            &body.contract_input,
            counter_party,
            body.oracle_announcements,
        )
        .await
        .map_err(|e| {
            Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail::with_reason(e.to_string()),
            )
        })?;

    format::json(offer)
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AcceptOfferBody {
    offer_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AcceptOfferResponse {
    contract_id: String,
    counter_party: String,
    accept_dlc: AcceptDlc,
}

#[debug_handler]
pub async fn accept_offer(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
    Json(body): Json<AcceptOfferBody>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let offer_id_bytes = hex::decode(&body.offer_id).map_err(|e| {
        Error::CustomError(
            StatusCode::BAD_REQUEST,
            ErrorDetail::with_reason(e.to_string()),
        )
    })?;

    let mut offer_id = [0u8; 32];
    offer_id.copy_from_slice(&offer_id_bytes);

    let accept = ddk
        .dlcdevkit
        .accept_dlc_offer(offer_id)
        .await
        .map_err(|e| {
            Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail::with_reason(e.to_string()),
            )
        })?;

    format::json(AcceptOfferResponse {
        contract_id: accept.0,
        counter_party: accept.1,
        accept_dlc: accept.2,
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/offers/")
        .add("/", get(index))
        .add("/", post(send_offer))
        .add("/accept", post(accept_offer))
}
