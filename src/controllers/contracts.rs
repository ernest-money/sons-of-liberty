#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use crate::{common::dlcdevkit, models::users, sol::SonsOfLiberty};
use axum::{debug_handler, extract::Query, http::StatusCode, Extension};
use loco_rs::{controller::ErrorDetail, prelude::*};
use serde::{Deserialize, Serialize};

use super::auth::CookieAuth;

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
    cookie: CookieAuth,
    Query(query): Query<GetContractByIdQuery>,
    Extension(ddk): Extension<Arc<SonsOfLiberty>>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &cookie.user.pid).await?;

    let contracts = dlcdevkit::get_filtered_contracts(ddk.dlcdevkit.storage.clone(), query.filter)?;

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

pub fn routes() -> Routes {
    Routes::new().prefix("api/contracts/").add("/", get(index))
}
