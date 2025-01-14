#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use crate::{models::users, sol::SonsOfLiberty};
use axum::{debug_handler, extract::Query, http::StatusCode, Extension};
use ddk_manager::Storage;
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub enum ContractFilter {
    All,
    Signed,
    Confirmed,
    Preclosed,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetContractByIdQuery {
    id: Option<String>,
    filter: Option<ContractFilter>,
}

#[debug_handler]
pub async fn index(
    auth: auth::JWT,
    Query(query): Query<GetContractByIdQuery>,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let contracts = get_filtered_contracts(ddk.dlcdevkit.storage.clone(), query.filter)?;

    if let Some(id) = query.id {
        let contract = contracts
            .iter()
            .find(|contract| contract["id"] == id)
            .ok_or(Error::CustomError(
                StatusCode::NOT_FOUND,
                ErrorDetail::with_reason("Contract not found"),
            ))?;
        return format::json(contract);
    }

    format::json(contracts)
}

fn get_filtered_contracts<S: Storage>(
    contracts: Arc<S>,
    filter: Option<ContractFilter>,
) -> Result<Vec<Value>, loco_rs::Error> {
    let filter = filter.unwrap_or(ContractFilter::All);
    let contracts_result: Result<Vec<Value>, loco_rs::Error> = match filter {
        ContractFilter::All => {
            let contracts = contracts
                .get_contracts()
                .map_err(storage_error_to_http_error)?;
            Ok(contracts
                .into_iter()
                .map(|contract| ddk::json::contract_to_value(&contract))
                .collect())
        }
        ContractFilter::Signed => {
            let signed_contracts = contracts
                .get_signed_contracts()
                .map_err(storage_error_to_http_error)?;
            Ok(signed_contracts
                .into_iter()
                .map(|contract| ddk::json::signed_contract_to_value(&contract, "signed"))
                .collect())
        }
        ContractFilter::Confirmed => {
            let confirmed_contracts = contracts
                .get_confirmed_contracts()
                .map_err(storage_error_to_http_error)?;
            Ok(confirmed_contracts
                .into_iter()
                .map(|contract| ddk::json::signed_contract_to_value(&contract, "confirmed"))
                .collect())
        }
        ContractFilter::Preclosed => {
            let preclosed_contracts = contracts
                .get_preclosed_contracts()
                .map_err(storage_error_to_http_error)?;
            Ok(preclosed_contracts
                .into_iter()
                .map(|contract| ddk::json::preclosed_contract_to_value(&contract))
                .collect())
        }
    };

    contracts_result
}

fn storage_error_to_http_error(e: ddk_manager::error::Error) -> Error {
    Error::CustomError(
        StatusCode::NOT_FOUND,
        ErrorDetail::with_reason(e.to_string()),
    )
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/contracts/").add("/", get(index))
}
