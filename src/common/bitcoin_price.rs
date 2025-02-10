use serde::{Deserialize, Deserializer, Serialize};
// use serde_this_or_that::as_f64;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct SpotPrice {
    pub currency: String,
    #[serde(deserialize_with = "string_to_f64")]
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
struct CoinbaseResponse {
    data: SpotPriceResponse,
}

// Custom deserializer function
fn string_to_f64<'de, D>(deserializer: D) -> Result<f64, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = String::deserialize(deserializer)?;
    s.parse::<f64>().map_err(serde::de::Error::custom)
}

/// The response from Coinbase for a spot Bitcoin price in USD.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpotPriceResponse {
    #[serde(deserialize_with = "string_to_f64")]
    pub amount: f64,
    pub base: String,
    pub currency: String,
}

pub async fn get_bitcoin_price() -> Result<SpotPrice, loco_rs::Error> {
    let price_from_coinbase = reqwest::get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
        .await?
        .json::<CoinbaseResponse>()
        .await?;

    tracing::info!(price = price_from_coinbase.data.amount);

    Ok(SpotPrice {
        currency: "USD".to_string(),
        amount: price_from_coinbase.data.amount,
    })
}
