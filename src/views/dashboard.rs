use std::sync::Arc;

use crate::common::dlcdevkit;
use loco_rs::prelude::*;

use crate::sol::SonsOfLiberty;

pub fn home(v: impl ViewRenderer, sol: Arc<SonsOfLiberty>) -> Result<impl IntoResponse> {
    let balance = dlcdevkit::get_balance(sol)?;
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
