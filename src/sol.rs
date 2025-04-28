use axum::http::StatusCode;
use bitcoin::bip32::Xpriv;
use bitcoin::io::Write;
use bitcoin::key::rand::Fill;
use bitcoin::Network;
use ddk::builder::Builder;
use ddk::oracle::kormir::KormirOracleClient;
use ddk::storage::postgres::PostgresStore;
use ddk::transport::nostr::NostrDlc;
use ddk::DlcDevKit;
use loco_rs::app::AppContext;
use loco_rs::controller::ErrorDetail;
use std::fs::{create_dir_all, File};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::sync::Arc;

use crate::common::nostr::Nostr;
use crate::common::settings::Settings;

type SonsOfLiberyDdk = DlcDevKit<NostrDlc, PostgresStore, KormirOracleClient>;

#[derive(Clone)]
pub struct SonsOfLiberty {
    pub dlcdevkit: Arc<SonsOfLiberyDdk>,
    pub nostr: Nostr,
}

impl SonsOfLiberty {
    pub async fn new(settings: Settings, ctx: &AppContext) -> loco_rs::Result<Self> {
        let liberty_dir = match settings.data_dir.as_str() {
            "home" => homedir::my_home()
                .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?
                .ok_or_else(|| loco_rs::Error::string("Failed to get home directory"))?
                .join(".sons-of-liberty"),
            _ => PathBuf::from(&settings.data_dir),
        };

        let network = Network::from_str(&settings.network)
            .map_err(|_| loco_rs::Error::string("Invalid network"))?;

        let seed_bytes = xprv_from_path(&liberty_dir, network)?;

        let storage = Arc::new(
            PostgresStore::new(&ctx.config.database.uri, true, settings.name.clone())
                .await
                .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?,
        );

        let transport = Arc::new(
            NostrDlc::new(
                &seed_bytes.private_key.secret_bytes(),
                &settings.nostr_relay,
                network,
            )
            .await
            .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?,
        );
        let oracle = Arc::new(
            KormirOracleClient::new(&settings.kormir_host, None)
                .await
                .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?,
        );

        let dlcdevkit = Arc::new(
            Builder::new()
                .set_esplora_host(settings.esplora_host)
                .set_network(network)
                .set_name(&settings.name)
                .set_seed_bytes(seed_bytes.private_key.secret_bytes())
                .set_storage(storage.clone())
                .set_transport(transport.clone())
                .set_oracle(oracle.clone())
                .finish()
                .await
                .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?,
        );

        let nostr = Nostr::new(
            &seed_bytes.private_key.secret_bytes(),
            vec![settings.nostr_relay.clone()],
        )
        .await
        .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?;

        Ok(Self { dlcdevkit, nostr })
    }
}

/// Helper function that reads `[bitcoin::bip32::Xpriv]` bytes from a file.
/// If the file does not exist then it will create a file `seed.ddk` in the specified path.
pub fn xprv_from_path(path: &PathBuf, network: Network) -> loco_rs::Result<Xpriv> {
    if !path.exists() {
        create_dir_all(path).map_err(|e| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create directory for ddk seed path".to_string()),
                },
            )
        })?;
    }
    let seed_path = path.join("seed.ddk");

    if Path::new(&seed_path).exists() {
        let seed = std::fs::read(&seed_path).map_err(|e| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to read seed file".to_string()),
                },
            )
        })?;
        let mut key = [0; 32];
        key.copy_from_slice(&seed);
        Xpriv::new_master(network, &key).map_err(|e| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create xprv from seed".to_string()),
                },
            )
        })
    } else {
        let mut file = File::create(&seed_path).map_err(|e| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create seed file".to_string()),
                },
            )
        })?;
        let mut entropy = [0u8; 32];
        entropy
            .try_fill(&mut bitcoin::key::rand::thread_rng())
            .map_err(|e| {
                loco_rs::Error::CustomError(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorDetail {
                        error: Some(e.to_string()),
                        description: Some("Failed to fill entropy for new seed".to_string()),
                    },
                )
            })?;
        let xprv = Xpriv::new_master(network, &entropy).map_err(|e| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to create xprv from generated seed".to_string()),
                },
            )
        })?;
        file.write_all(&entropy).map_err(|e| {
            loco_rs::Error::CustomError(
                StatusCode::INTERNAL_SERVER_ERROR,
                ErrorDetail {
                    error: Some(e.to_string()),
                    description: Some("Failed to write seed to file".to_string()),
                },
            )
        })?;
        Ok(xprv)
    }
}
