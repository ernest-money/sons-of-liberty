use crate::models::_entities::seeds;

use super::_entities::seeds::Column;
pub use super::_entities::seeds::{ActiveModel, Entity, Model};
use bitcoin::{
    bip32::Xpriv,
    key::rand::{thread_rng, Fill},
    Network,
};
use sea_orm::{entity::prelude::*, ActiveValue, TransactionTrait};
pub type Seeds = Entity;

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

// implement your read-oriented logic here
impl Model {
    /// Creates or loads the seed from the database with the given instance name.
    ///
    /// # Errors
    ///
    /// - `DbErr` if the seed cannot be created or loaded.
    pub async fn create_or_load_seed(
        db: &DatabaseConnection,
        name: &str,
        network: Network,
    ) -> Result<([u8; 32], Xpriv), loco_rs::Error> {
        let txn = db.begin().await?;
        let seed = Seeds::find()
            .filter(Column::Name.eq(name))
            .one(&txn)
            .await?;

        let (entropy, xprv) = if let Some(seed) = seed {
            tracing::info!("Loading seed from database for {}", name);
            let mut entropy = [0u8; 32];
            entropy.copy_from_slice(&seed.seed);
            let xprv = Xpriv::new_master(network, &entropy).map_err(|e| {
                loco_rs::Error::string(format!("Failed to create xprv from seed: {e}").as_str())
            })?;
            (entropy, xprv)
        } else {
            tracing::info!("Creating new seed for {}", name);
            let mut entropy = [0; 32];
            entropy.try_fill(&mut thread_rng()).map_err(|e| {
                loco_rs::Error::string(format!("Failed to fill entropy: {e}").as_str())
            })?;
            let xprv = Xpriv::new_master(network, &entropy).map_err(|e| {
                loco_rs::Error::string(format!("Failed to create xprv from seed: {e}").as_str())
            })?;
            let seed = seeds::ActiveModel {
                name: ActiveValue::Set(name.to_string()),
                seed: ActiveValue::Set(entropy.to_vec()),
                ..Default::default()
            };
            seed.insert(&txn).await?;
            (entropy, xprv)
        };

        txn.commit().await?;
        Ok((entropy, xprv))
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
