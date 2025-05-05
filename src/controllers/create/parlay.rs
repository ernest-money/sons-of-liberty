#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::{str::FromStr, sync::Arc};

use crate::controllers::auth::CookieAuth;
use crate::{models::users, sol::SonsOfLiberty};
use axum::{http::StatusCode, Extension, Json};
use ddk::nostr::nostr_to_bitcoin_pubkey;
use ddk_manager::{
    contract::{
        contract_input::{ContractInput, ContractInputInfo, OracleInput},
        numerical_descriptor::NumericalDescriptor,
        ContractDescriptor,
    },
    payout_curve::{
        PayoutFunction, PayoutFunctionPiece, PayoutPoint, PolynomialPayoutCurvePiece,
        RoundingInterval, RoundingIntervals,
    },
};
use dlc_trie::OracleNumericInfo;
use ernest_oracle::parlay::CombinationMethod;
use ernest_oracle::{parlay::ParlayParameter, routes::CreateEvent};
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateParlayEvent {
    parlay_parameters: Vec<ParlayParameter>,
    combination_method: CombinationMethod,
    /// This can be defaulted on the oracle side
    max_normalized_value: Option<u64>,
    event_maturity_epoch: u32,
    counterparty: String,
    offer_collateral: u64,
    accept_collateral: u64,
    fee_rate: u64,
}

pub async fn create_parlay_event(
    cookie: CookieAuth,
    State(ctx): State<AppContext>,
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    Json(body): Json<CreateParlayEvent>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let counterparty =
        nostr_to_bitcoin_pubkey(&nostr::PublicKey::from_str(&body.counterparty).unwrap());

    let event = CreateEvent::Parlay {
        parameters: body.parlay_parameters,
        combination_method: body.combination_method,
        max_normalized_value: body.max_normalized_value,
        event_maturity_epoch: body.event_maturity_epoch,
    };

    tracing::info!(
        "Creating contract offer to {}: {:?}",
        body.counterparty.to_string(),
        event
    );

    let announcement = sol
        .dlcdevkit
        .oracle
        .create_event(event)
        .await
        .map_err(|e| {
            Error::CustomError(
                StatusCode::BAD_REQUEST,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create event".to_string()),
                },
            )
        })?;

    tracing::info!(
        "Created announcement for event: {}",
        announcement.oracle_event.event_id
    );

    let max_normalized_value = body.max_normalized_value.unwrap_or(10_000);
    let (nb_digits, max_oracle_value) =
        ernest_oracle::oracle::calculate_oracle_parameters(max_normalized_value);

    tracing::info!("Max value of oracle event: {}", max_oracle_value);

    let payout_curve = PayoutFunctionPiece::PolynomialPayoutCurvePiece(
        PolynomialPayoutCurvePiece::new(vec![
            PayoutPoint {
                event_outcome: 0,
                outcome_payout: 0,
                extra_precision: 0,
            },
            PayoutPoint {
                event_outcome: max_normalized_value,
                outcome_payout: body.offer_collateral + body.accept_collateral,
                extra_precision: 0,
            },
        ])
        .map_err(|e| {
            Error::CustomError(
                StatusCode::BAD_REQUEST,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create payout function".to_string()),
                },
            )
        })?,
    );

    let upper_bound = PayoutFunctionPiece::PolynomialPayoutCurvePiece(
        PolynomialPayoutCurvePiece::new(vec![
            PayoutPoint {
                event_outcome: max_normalized_value,
                outcome_payout: body.offer_collateral + body.accept_collateral,
                extra_precision: 0,
            },
            PayoutPoint {
                event_outcome: max_oracle_value,
                outcome_payout: body.offer_collateral + body.accept_collateral,
                extra_precision: 0,
            },
        ])
        .map_err(|e| {
            Error::CustomError(
                StatusCode::BAD_REQUEST,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create payout function".to_string()),
                },
            )
        })?,
    );

    tracing::info!("Created payout function");

    let oracle_numeric_infos = OracleNumericInfo {
        base: 2,
        nb_digits: vec![nb_digits as usize],
    };

    let contract_descriptor = ContractDescriptor::Numerical(NumericalDescriptor {
        payout_function: PayoutFunction::new(vec![payout_curve, upper_bound]).unwrap(),
        rounding_intervals: RoundingIntervals {
            intervals: vec![RoundingInterval {
                begin_interval: 0,
                rounding_mod: 1,
            }],
        },
        difference_params: None,
        oracle_numeric_infos,
    });

    tracing::info!("Created contract descriptor: {:?}", contract_descriptor);

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

    tracing::info!(
        "Sending DLC offer to counterparty: {}",
        body.counterparty.to_string()
    );

    let offer = sol
        .dlcdevkit
        .manager
        .send_offer_with_announcements(
            &contract_input,
            counterparty,
            vec![vec![announcement.clone()]],
        )
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

    tracing::info!(
        "Created contract offer to {}: {}",
        body.counterparty.to_string(),
        hex::encode(offer.temporary_contract_id)
    );

    format::json(serde_json::json!({
        "id": hex::encode(offer.temporary_contract_id),
        "oracle_event_id": announcement.oracle_event.event_id,
    }))
}
