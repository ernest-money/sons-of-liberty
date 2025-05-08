use crate::{common::settings::Settings, views::balances::TimePeriod};

use super::_entities::balances::Column;
pub use super::_entities::balances::{ActiveModel, Entity, Model};
use chrono::{DateTime, Duration, Utc};
use ddk::Balance;
use sea_orm::{entity::prelude::*, ActiveValue, Condition, QueryOrder, TransactionTrait};
pub type Balances = Entity;

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
    pub async fn get_history(
        db: &DatabaseConnection,
        time_period: TimePeriod,
        reference_date: DateTime<Utc>,
    ) -> Result<Vec<Self>, DbErr> {
        let start_date = match time_period {
            TimePeriod::Day => reference_date - Duration::hours(24),
            TimePeriod::Week => reference_date - Duration::days(7),
            TimePeriod::Month => reference_date - Duration::days(30),
            TimePeriod::Year => reference_date - Duration::days(365),
        };

        // Query balances within the time range
        let balances = Balances::find()
            .filter(
                Condition::all()
                    .add(Column::CreatedAt.gte(start_date))
                    .add(Column::CreatedAt.lte(reference_date)),
            )
            .order_by_asc(Column::CreatedAt)
            .all(db)
            .await?;

        Ok(balances)
    }
}

// implement your write-oriented logic here
impl ActiveModel {
    pub async fn create_balance_update(
        db: &DatabaseConnection,
        settings: &Settings,
        balance: Balance,
        price: f64,
        num_contracts: usize,
    ) -> Result<(), DbErr> {
        let txn = db.begin().await?;
        let balance_update = ActiveModel {
            bitcoin_balance_sats: ActiveValue::Set(balance.confirmed.to_sat() as i64),
            bitcoin_balance_usd: ActiveValue::Set(
                Decimal::from_f64_retain(balance.confirmed.to_btc() * price)
                    .unwrap_or(Decimal::ZERO),
            ),
            bitcoin_price: ActiveValue::Set(
                Decimal::from_f64_retain(price).unwrap_or(Decimal::ZERO),
            ),
            contract_balance_sats: ActiveValue::Set(balance.contract.to_sat() as i64),
            contract_balance_usd: ActiveValue::Set(
                Decimal::from_f64_retain(balance.contract.to_btc() * price)
                    .unwrap_or(Decimal::ZERO),
            ),
            pnl_sats: ActiveValue::Set(balance.contract_pnl),
            pnl_usd: ActiveValue::Set(
                Decimal::from_f64_retain(balance.contract_pnl as f64 * price)
                    .unwrap_or(Decimal::ZERO),
            ),
            num_contracts: ActiveValue::Set(num_contracts as i64),
            name: ActiveValue::Set(settings.name.clone()),
            network: ActiveValue::Set(settings.network.clone()),
            ..Default::default()
        };
        balance_update.insert(&txn).await?;
        txn.commit().await?;
        Ok(())
    }
}

// implement your custom finders, selectors oriented logic here
impl Entity {}
