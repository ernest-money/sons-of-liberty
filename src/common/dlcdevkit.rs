use std::sync::Arc;

use axum::http::StatusCode;
use bitcoin::{Address, Transaction};
use ddk::storage::postgres::PostgresStore;
use ddk::storage::sqlx::ContractRowNoBytes;
use ddk::wallet::LocalOutput;
use ddk::Balance;
use loco_rs::{controller::ErrorDetail, prelude::*};

use crate::{controllers::contracts::ContractFilter, sol::SonsOfLiberty};

pub async fn get_balance(ddk: Arc<SonsOfLiberty>) -> Result<Balance> {
    ddk.dlcdevkit.balance().await.map_err(|e| {
        Error::CustomError(
            StatusCode::NOT_FOUND,
            ErrorDetail::with_reason(e.to_string()),
        )
    })
}

pub async fn get_offers(storage: Arc<PostgresStore>) -> Result<Vec<ContractRowNoBytes>> {
    storage
        .get_offer_rows()
        .await
        .map_err(sqlx_error_to_http_error)
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

pub async fn get_filtered_contracts(
    storage: Arc<PostgresStore>,
    filter: Option<ContractFilter>,
) -> Result<Vec<ContractRowNoBytes>, loco_rs::Error> {
    let filter = filter.unwrap_or(ContractFilter::All);
    match filter {
        ContractFilter::All => {
            let contracts = storage
                .get_contract_rows(None)
                .await
                .map_err(sqlx_error_to_http_error)?;
            Ok(contracts)
        }
        ContractFilter::Active => {
            let active_contracts = storage
                .get_contract_rows(Some(vec![
                    "accepted".to_string().into(),
                    "signed".to_string().into(),
                    "confirmed".to_string().into(),
                    "pre-closed".to_string().into(),
                ]))
                .await
                .map_err(sqlx_error_to_http_error)?;
            Ok(active_contracts)
        }
        ContractFilter::Closed => {
            let closed_contracts = storage
                .get_contract_rows(Some(vec!["closed".to_string().into()]))
                .await
                .map_err(sqlx_error_to_http_error)?;
            Ok(closed_contracts)
        }
        ContractFilter::Failed => {
            let failed_contracts = storage
                .get_contract_rows(Some(vec![
                    "refunded".to_string().into(),
                    "failed-accept".to_string().into(),
                    "failed-sign".to_string().into(),
                    "rejected".to_string().into(),
                ]))
                .await
                .map_err(sqlx_error_to_http_error)?;
            Ok(failed_contracts)
        }
    }
}

fn sqlx_error_to_http_error(e: ddk::storage::sqlx::SqlxError) -> Error {
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
