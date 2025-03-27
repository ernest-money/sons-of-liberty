use std::sync::Arc;

use crate::common::dlcdevkit;
use loco_rs::prelude::*;

use crate::sol::SonsOfLiberty;

pub async fn home(v: impl ViewRenderer, sol: Arc<SonsOfLiberty>) -> Result<Response> {
    let balance = dlcdevkit::get_balance(sol).await?;
    format::render().view(
        &v,
        "index.html",
        data!({
            "balance": balance.confirmed.to_sat(),
            "unconfirmed_balance": balance.foreign_unconfirmed.to_sat() + balance.change_unconfirmed.to_sat(),
            "contract": balance.contract,
            "pnl": balance.contract_pnl,
        }),
    )
}

pub fn contracts(v: impl ViewRenderer, _sol: Arc<SonsOfLiberty>) -> Result<Response> {
    format::render().view(&v, "contracts.html", data!({}))
}

pub fn offers(v: impl ViewRenderer, _sol: Arc<SonsOfLiberty>) -> Result<Response> {
    format::render().view(&v, "offers.html", data!({}))
}
