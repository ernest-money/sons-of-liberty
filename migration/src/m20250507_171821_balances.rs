use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(m, "balances",
            &[
            ("bitcoin_balance_sats", ColType::BigInteger),
            ("bitcoin_balance_usd", ColType::Decimal),
            ("bitcoin_price", ColType::Decimal),
            ("contract_balance_sats", ColType::BigInteger),
            ("contract_balance_usd", ColType::Decimal),
            ("pnl_sats", ColType::BigInteger),
            ("pnl_usd", ColType::Decimal),
            ("num_contracts", ColType::BigInteger),
            ("name", ColType::String),
            ("network", ColType::String),
            ],
            &[
            ]
        ).await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "balances").await
    }
}
