#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use crate::{sol::SonsOfLiberty, views};
use axum::{debug_handler, Extension};
use loco_rs::prelude::*;

#[debug_handler]
pub async fn render_home(
    // auth: auth::JWT,
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    // State(ctx): State<AppContext>,
    ViewEngine(v): ViewEngine<TeraView>,
) -> Result<impl IntoResponse> {
    views::dashboard::home(v, sol).await
}

#[debug_handler]
pub async fn render_contracts(
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    ViewEngine(v): ViewEngine<TeraView>,
) -> Result<impl IntoResponse> {
    views::dashboard::contracts(v, sol)
}

#[debug_handler]
pub async fn render_offers(
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    ViewEngine(v): ViewEngine<TeraView>,
) -> Result<impl IntoResponse> {
    views::dashboard::offers(v, sol)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/")
        .add("/", get(render_home))
        .add("/contracts", get(render_contracts))
        .add("/offers", get(render_offers))
}
