#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::sync::Arc;

use crate::{sol::SonsOfLiberty, views};
use axum::{debug_handler, Extension};
use loco_rs::prelude::*;

#[debug_handler]
pub async fn render_home(
    Extension(sol): Extension<Arc<SonsOfLiberty>>,
    ViewEngine(v): ViewEngine<TeraView>,
) -> Result<impl IntoResponse> {
    views::dashboard::home(v, sol)
}
pub fn routes() -> Routes {
    Routes::new().prefix("/").add("/", get(render_home))
}
