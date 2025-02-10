use std::sync::Arc;

use loco_rs::prelude::*;

use crate::{
    app::SONS_OF_LIBERTY,
    common::{bitcoin_price::get_bitcoin_price, settings::Settings},
    sol::SonsOfLiberty,
};

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
            Some(settings) => {
                let settings = Settings::from_json(&settings)?;
                tracing::info!("Settings: {:?}", settings);
                settings
            }
            None => Settings::default(),
        };
        let ddk = SONS_OF_LIBERTY
            .get_or_init(|| async {
                tracing::warn!("Initializing DDK");
                Arc::new(
                    SonsOfLiberty::new(settings)
                        .await
                        .expect("Failed to initialize DDK"),
                )
            })
            .await;
        let balance = ddk.dlcdevkit.balance().unwrap();
        println!("Got the price? {:?}", price);
        println!("Got the balance? {:?}", balance);
        Ok(())
    }
}
