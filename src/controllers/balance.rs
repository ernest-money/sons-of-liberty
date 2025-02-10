#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use crate::{common::dlcdevkit, models::users, sol::SonsOfLiberty};
use axum::{debug_handler, Extension};
use bitcoin::SignedAmount;
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use super::auth::CookieAuth;

#[derive(Serialize, Deserialize, Clone, Debug)]

pub struct SolBalanceType {
    sats: u64,
    btc: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SolPnlType {
    sats: i64,
    btc: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SolBalance {
    confirmed: SolBalanceType,
    unconfirmed: SolBalanceType,
    contract: SolBalanceType,
    contract_pnl: SolPnlType,
}

#[debug_handler]
pub async fn index(
    cookie: CookieAuth,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let balance = dlcdevkit::get_balance(ddk)?;
    let sol_balance = SolBalance {
        confirmed: SolBalanceType {
            sats: balance.confirmed.to_sat(),
            btc: balance.confirmed.to_btc(),
        },
        unconfirmed: SolBalanceType {
            sats: (balance.change_unconfirmed + balance.foreign_unconfirmed).to_sat(),
            btc: (balance.change_unconfirmed + balance.foreign_unconfirmed).to_btc(),
        },
        contract: SolBalanceType {
            sats: balance.contract.to_sat(),
            btc: balance.contract.to_btc(),
        },
        contract_pnl: SolPnlType {
            sats: balance.contract_pnl,
            btc: SignedAmount::from_sat(balance.contract_pnl).to_btc(),
        },
    };
    format::json(sol_balance)
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/balance/").add("/", get(index))
}
