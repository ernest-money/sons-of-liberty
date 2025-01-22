use axum::{extract::Request, middleware::Next, response::Response};
use loco_rs::prelude::*;

use crate::models::users;

pub async fn require_auth(
    auth: auth::JWT,
    req: Request,
    next: Next,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    Ok(next.run(req).await)
}
