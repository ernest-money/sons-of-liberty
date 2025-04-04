#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::{str::FromStr, sync::Arc};

use super::auth::CookieAuth;
use crate::{models::users, sol::SonsOfLiberty};
use axum::{debug_handler, http::StatusCode, Extension, Json};
use bitcoin::secp256k1::PublicKey;
use ddk_manager::contract::{
    contract_input::{ContractInput, ContractInputInfo, OracleInput},
    enum_descriptor::EnumDescriptor,
    ContractDescriptor,
};
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateEnumContract {
    counterparty: String,
    offer_collateral: u64,
    accept_collateral: u64,
    fee_rate: u64,
    descriptor: EnumDescriptor,
    maturity: u32,
}

#[debug_handler]
pub async fn enum_create(
    cookie: CookieAuth,
    State(ctx): State<AppContext>,
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    Json(body): Json<CreateEnumContract>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let counterparty = PublicKey::from_str(&body.counterparty).map_err(|e| {
        Error::CustomError(
            StatusCode::BAD_REQUEST,
            ErrorDetail {
                error: Some(e.to_string()),
                description: Some("Invalid counterparty public key".to_string()),
            },
        )
    })?;

    let outcomes = body
        .descriptor
        .outcome_payouts
        .iter()
        .map(|outcome| outcome.outcome.clone())
        .collect::<Vec<_>>();

    let announcement = sol
        .dlcdevkit
        .oracle
        .create_enum_event(outcomes, body.maturity)
        .await
        .map_err(|e| {
            Error::CustomError(
                StatusCode::BAD_REQUEST,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create enum event".to_string()),
                },
            )
        })?;

    let contract_descriptor = ContractDescriptor::Enum(body.descriptor);

    let contract_input_info = ContractInputInfo {
        contract_descriptor,
        oracles: OracleInput {
            public_keys: vec![announcement.oracle_public_key],
            event_id: announcement.oracle_event.event_id.clone(),
            threshold: 1,
        },
    };

    let contract_input = ContractInput {
        offer_collateral: body.offer_collateral,
        accept_collateral: body.accept_collateral,
        fee_rate: body.fee_rate,
        contract_infos: vec![contract_input_info],
    };

    let offer = sol
        .dlcdevkit
        .send_dlc_offer(&contract_input, counterparty, vec![])
        .await
        .map_err(|e| {
            Error::CustomError(
                StatusCode::BAD_REQUEST,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Invalid counterparty public key".to_string()),
                },
            )
        })?;

    format::json(serde_json::json!({
        "id": hex::encode(offer.temporary_contract_id),
        "oracle_event_id": announcement.oracle_event.event_id,
    }))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/create/")
        .add("/enum", post(enum_create))
}
