use sea_orm::{
    prelude::Decimal, ConnectionTrait, Database, DatabaseConnection, FromQueryResult, Statement,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, FromQueryResult, Serialize, Deserialize)]
pub struct BitcoinCurrentStats {
    pub id: i32,
    pub hashrate: Decimal,
    pub difficulty: Decimal,
}

pub struct Market {
    db: DatabaseConnection,
}

impl Market {
    pub async fn new(db_connection_string: &str) -> Result<Self, loco_rs::Error> {
        let db = Database::connect(db_connection_string).await.unwrap();
        Ok(Self { db })
    }

    pub async fn get_hashrate_stats(&self) -> Result<Vec<BitcoinCurrentStats>, loco_rs::Error> {
        let statement = Statement::from_string(
            self.db.get_database_backend(),
            "SELECT * FROM bitcoin_current_stats".to_string(),
        );

        let result = self.db.query_all(statement).await?;

        Ok(result
            .iter()
            .map(|row| BitcoinCurrentStats {
                id: row.try_get("", "id").unwrap(),
                hashrate: row.try_get("", "hashrate").unwrap(),
                difficulty: row.try_get("", "difficulty").unwrap(),
            })
            .collect())
    }
}
