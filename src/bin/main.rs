#![allow(clippy::result_large_err)]
use loco_rs::cli;
use migration::Migrator;
use sons_of_liberty::app::App;

#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    cli::main::<App, Migrator>().await
}
