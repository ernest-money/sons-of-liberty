#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::str::FromStr;

use crate::{ddk::SonsOfLiberty, models::users};
use axum::{debug_handler, extract::Query, http::StatusCode, Extension};
use bitcoin::secp256k1::PublicKey;
use ddk_manager::{contract::contract_input::ContractInput, Storage};
use dlc_messages::oracle_msgs::OracleAnnouncement;
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GetOfferByIdQuery {
    id: Option<String>,
}

#[debug_handler]
pub async fn index(
    auth: auth::JWT,
    Query(query): Query<GetOfferByIdQuery>,
    Extension(ddk): Extension<SonsOfLiberty>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let offers = ddk.dlcdevkit.storage.get_contract_offers().map_err(|e| {
        Error::CustomError(
            StatusCode::NOT_FOUND,
            ErrorDetail::with_reason(e.to_string()),
        )
    })?;

    let offers = offers
        .into_iter()
        .map(|offer| ddk::json::offered_contract_to_value(&offer, "offer"))
        .collect::<Vec<_>>();

    if let Some(id) = query.id {
        let offer = offers
            .iter()
            .find(|offer| offer["id"] == id)
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
    auth: auth::JWT,
    Extension(ddk): Extension<SonsOfLiberty>,
    State(ctx): State<AppContext>,
    Json(body): Json<SendOfferBody>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/offers/")
        .add("/", get(index))
        .add("/", post(send_offer))
}
