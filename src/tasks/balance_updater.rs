use std::sync::Arc;

use crate::{
    app::SONS_OF_LIBERTY,
    common::{bitcoin_price::get_bitcoin_price, settings::Settings},
    models::_entities::balances,
    sol::SonsOfLiberty,
};
use axum::http::StatusCode;
use ddk_manager::Storage;
use loco_rs::{controller::ErrorDetail, prelude::*};

pub struct BalanceUpdater;
#[async_trait]
impl Task for BalanceUpdater {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "balance_updater".to_string(),
            detail: "Gets the balance of the wallet and stores it for historical retrieval."
                .to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, _vars: &task::Vars) -> Result<()> {
        let price = get_bitcoin_price().await?;
        let settings = match &app_context.config.settings {
            Some(settings) => Settings::from_json(settings)?,
            None => Settings::default(),
        };

        let ddk = SONS_OF_LIBERTY
            .get_or_init(|| async {
                tracing::warn!("Initializing DDK");
                Arc::new(
                    SonsOfLiberty::new(&settings, app_context)
                        .await
                        .expect("Failed to initialize DDK"),
                )
            })
            .await;
        let balance = ddk.dlcdevkit.balance().await.map_err(|_| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail::with_reason("Failed to get balance"),
            )
        })?;

        // get sat value, amount, price, pnl, contract balance, and amount of contracts, then store in db..

        let num_contracts = ddk
            .dlcdevkit
            .storage
            .get_contracts()
            .await
            .map_err(|e| {
                loco_rs::Error::CustomError(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorDetail::with_reason(&format!("Failed to get contracts: {e}")),
                )
            })?
            .len();

        balances::ActiveModel::create_balance_update(
            &app_context.db,
            &settings,
            balance,
            price.amount,
            num_contracts,
        )
        .await?;

        Ok(())
    }
}
