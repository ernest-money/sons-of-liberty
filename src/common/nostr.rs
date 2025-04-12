use std::time::Duration;

use nostr::{
    event::{EventBuilder, Kind, Tag, TagKind},
    filter::{Alphabet, Filter, SingleLetterTag},
    key::{Keys, PublicKey, SecretKey},
    nips::nip01::Metadata,
    util::JsonUtil,
};
use nostr_sdk::Client;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TradeCounterpartyError {
    #[error("Invalid bytes for nostr secret key: {0}")]
    InvalidBytes(#[from] nostr::key::Error),
    #[error("Nostr subscription failed: {0}")]
    SubscriptionError(#[from] nostr_sdk::client::Error),
    #[error("Error with nostr event: {0}")]
    NostrEvent(#[from] nostr::event::Error),
    #[error("Nostr profile does not exist: {0}")]
    NostrProfileDoesNotExist(PublicKey),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NostrCounterparty {
    pub pubkey: PublicKey,
    pub name: String,
    pub about: String,
    pub picture: String,
    pub website: String,
}

#[derive(Debug, Clone)]
pub struct Nostr {
    keys: Keys,
    nostr_client: Client,
}

impl Nostr {
    /// Creates a new Nostr client instance with the provided secret key and relay URLs.
    ///
    /// This function initializes a Nostr client with the given secret key and connects to the specified relays.
    /// It sets up the necessary cryptographic keys and establishes connections to the Nostr network.
    ///
    /// # Arguments
    /// * `secret_key_bytes` - A 32-byte array containing the secret key for the Nostr identity
    /// * `relays` - A vector of relay URLs to connect to
    ///
    /// # Returns
    /// A Result containing either the initialized Nostr client or a TradeCounterpartyError if initialization fails
    pub async fn new(
        secret_key_bytes: &[u8; 32],
        relays: Vec<String>,
    ) -> Result<Self, TradeCounterpartyError> {
        let secret_key = SecretKey::from_slice(secret_key_bytes)?;
        let keys = Keys::new(secret_key);
        let nostr_client = Client::new(keys.clone());
        for relay in relays {
            let _ = nostr_client
                .add_relay(relay)
                .await
                .map_err(|e| tracing::error!("Could not connect to relay: {}", e.to_string()));
        }

        nostr_client.connect().await;

        Ok(Self { keys, nostr_client })
    }

    /// Creates or updates a DLC (Discreet Log Contract) profile on the Nostr network.
    ///
    /// This function publishes a metadata event to the Nostr network that includes the user's name and about information,
    /// along with a special tag indicating DLC support. This allows other users to discover and verify DLC-capable
    /// counterparties on the network.
    ///
    /// # Arguments
    /// * `name` - The display name for the DLC profile
    /// * `about` - A description or additional information about the DLC profile
    ///
    /// # Returns
    /// A Result containing either the published metadata or a TradeCounterpartyError if the operation fails
    pub async fn create_or_update_dlc_profile(
        &self,
        name: String,
        about: String,
    ) -> Result<Metadata, TradeCounterpartyError> {
        let metadata = Metadata::new().name(name).about(about);

        let event = EventBuilder::new(Kind::Metadata, metadata.as_json())
            .tag(Tag::custom(
                TagKind::SingleLetter(SingleLetterTag::lowercase(Alphabet::D)),
                ["dlc_support=true"],
            ))
            .build(self.keys.public_key)
            .sign_with_keys(&self.keys)?;

        self.nostr_client.send_event(&event).await?;

        Ok(metadata)
    }

    /// Retrieves a specific trade counterparty's profile information from the Nostr network.
    ///
    /// This function fetches the metadata event for a given public key and converts it into a
    /// NostrCounterparty struct containing the user's profile information. It's used to verify
    /// and display information about potential trading partners.
    ///
    /// # Arguments
    /// * `pubkey` - The public key of the counterparty to look up
    ///
    /// # Returns
    /// A Result containing either the counterparty's profile information or a TradeCounterpartyError if the profile doesn't exist
    pub async fn get_trade_counterparty(
        &self,
        pubkey: PublicKey,
    ) -> Result<NostrCounterparty, TradeCounterpartyError> {
        let event = self
            .nostr_client
            .fetch_metadata(pubkey, Duration::from_secs(5))
            .await?
            .ok_or(TradeCounterpartyError::NostrProfileDoesNotExist(pubkey))?;

        Ok(NostrCounterparty {
            pubkey,
            name: event.name.unwrap_or_default(),
            about: event.about.unwrap_or_default(),
            picture: event.picture.unwrap_or_default(),
            website: event.website.unwrap_or_default(),
        })
    }

    /// Retrieves a list of all DLC-capable trade counterparties from the Nostr network.
    ///
    /// This function queries the Nostr network for all metadata events that have the DLC support tag,
    /// allowing users to discover other DLC-capable trading partners. It converts each metadata event
    /// into a NostrCounterparty struct for easy use in the application.
    ///
    /// # Returns
    /// A Result containing either a vector of all discovered DLC-capable counterparties or a TradeCounterpartyError if the query fails
    pub async fn get_trade_counterparties(
        &self,
    ) -> Result<Vec<NostrCounterparty>, TradeCounterpartyError> {
        let events = self
            .nostr_client
            .fetch_events(trade_counterparty_filter(), Duration::from_secs(5))
            .await?;

        let profiles = events
            .iter()
            .map(|event| {
                let metadata = Metadata::try_from(event).unwrap();
                NostrCounterparty {
                    pubkey: event.pubkey,
                    name: metadata.name.unwrap_or_default(),
                    about: metadata.about.unwrap_or_default(),
                    picture: metadata.picture.unwrap_or_default(),
                    website: metadata.website.unwrap_or_default(),
                }
            })
            .collect::<Vec<NostrCounterparty>>();

        Ok(profiles)
    }
}

fn trade_counterparty_filter() -> Filter {
    Filter::new()
        .kind(Kind::Metadata)
        .custom_tag(SingleLetterTag::lowercase(Alphabet::D), "dlc_support=true")
}

#[cfg(test)]
mod tests {
    use bitcoin::key::rand::{thread_rng, Fill};

    use super::*;

    #[tokio::test]
    async fn test_counterparty_profile() {
        let mut bytes = [0; 32];
        bytes.try_fill(&mut thread_rng()).unwrap();
        let nostr = Nostr::new(&bytes, vec!["ws://localhost:8081".to_string()])
            .await
            .unwrap();

        let profiles = nostr.get_trade_counterparties().await.unwrap();
        assert!(profiles.len() >= 1);
    }

    #[tokio::test]
    async fn test_counterparty_profile_does_not_exist() {
        let mut bytes = [0; 32];
        bytes.try_fill(&mut thread_rng()).unwrap();
        let nostr = Nostr::new(&bytes, vec!["ws://localhost:8081".to_string()])
            .await
            .unwrap();

        nostr
            .create_or_update_dlc_profile("test".to_string(), "test".to_string())
            .await
            .unwrap();

        let profile = nostr.get_trade_counterparty(nostr.keys.public_key).await;
        assert!(profile.is_ok());
    }
}
