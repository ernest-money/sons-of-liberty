pub use crate::models::_entities::balances::Model as Balances;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone, Copy)]
pub struct BalanceHistoryRequest {
    pub time_period: TimePeriod,
    #[serde(default = "default_reference_date")]
    pub reference_date: DateTime<Utc>,
}

// Define the time period enum for the API request
#[derive(Deserialize, Serialize, Debug, Clone, Copy)]
pub enum TimePeriod {
    #[serde(rename = "24h")]
    Day,
    #[serde(rename = "1w")]
    Week,
    #[serde(rename = "1m")]
    Month,
    #[serde(rename = "1y")]
    Year,
}

pub fn default_reference_date() -> DateTime<Utc> {
    Utc::now()
}
