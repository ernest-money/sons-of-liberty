use std::sync::Arc;

use axum::http::StatusCode;
use bitcoin::{Address, Transaction};
use ddk::wallet::LocalOutput;
use ddk::Balance;
use ddk_manager::contract::offered_contract::OfferedContract;
use ddk_manager::Storage;
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde_json::Value;

use crate::{controllers::contracts::ContractFilter, sol::SonsOfLiberty};

pub async fn get_balance(ddk: Arc<SonsOfLiberty>) -> Result<Balance> {
    ddk.dlcdevkit.balance().await.map_err(|e| {
        Error::CustomError(
            StatusCode::NOT_FOUND,
            ErrorDetail::with_reason(e.to_string()),
        )
    })
}

// pub fn get_contracts(ddk: Arc<SonsOfLiberty>) -> Result<Vec<Contract>> {
//     ddk.dlcdevkit
//         .storage
//         .get_contracts()
//         .map_err(storage_error_to_http_error)
// }

pub async fn get_offers(ddk: Arc<SonsOfLiberty>) -> Result<Vec<OfferedContract>> {
    ddk.dlcdevkit
        .storage
        .get_contract_offers()
        .await
        .map_err(storage_error_to_http_error)
}

pub async fn get_new_addresses(ddk: Arc<SonsOfLiberty>) -> Result<Address> {
    Ok(ddk
        .dlcdevkit
        .wallet
        .new_external_address()
        .await
        .map_err(wallet_error_to_http_error)?
        .address)
}

pub fn get_transactions(ddk: Arc<SonsOfLiberty>) -> Result<Vec<Arc<Transaction>>> {
    Ok(ddk
        .dlcdevkit
        .wallet
        .get_transactions()
        .map_err(wallet_error_to_http_error)?)
}

pub fn get_utxos(ddk: Arc<SonsOfLiberty>) -> Result<Vec<LocalOutput>> {
    Ok(ddk
        .dlcdevkit
        .wallet
        .list_utxos()
        .map_err(wallet_error_to_http_error)?)
}

pub async fn get_filtered_contracts<S: Storage>(
    contracts: Arc<S>,
    filter: Option<ContractFilter>,
) -> Result<Vec<Value>, loco_rs::Error> {
    let filter = filter.unwrap_or(ContractFilter::All);
    let contracts_result: Result<Vec<Value>, loco_rs::Error> = match filter {
        ContractFilter::All => {
            let contracts = contracts
                .get_contracts()
                .await
                .map_err(storage_error_to_http_error)?;
            Ok(contracts
                .into_iter()
                .map(|contract| ddk::json::contract_to_value(&contract))
                .collect())
        }
        ContractFilter::Signed => {
            let signed_contracts = contracts
                .get_signed_contracts()
                .await
                .map_err(storage_error_to_http_error)?;
            Ok(signed_contracts
                .into_iter()
                .map(|contract| ddk::json::signed_contract_to_value(&contract, "signed"))
                .collect())
        }
        ContractFilter::Confirmed => {
            let confirmed_contracts = contracts
                .get_confirmed_contracts()
                .await
                .map_err(storage_error_to_http_error)?;
            Ok(confirmed_contracts
                .into_iter()
                .map(|contract| ddk::json::signed_contract_to_value(&contract, "confirmed"))
                .collect())
        }
        ContractFilter::Preclosed => {
            let preclosed_contracts = contracts
                .get_preclosed_contracts()
                .await
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

fn wallet_error_to_http_error(e: ddk::error::WalletError) -> Error {
    Error::CustomError(
        StatusCode::BAD_REQUEST,
        ErrorDetail::with_reason(e.to_string()),
    )
}
