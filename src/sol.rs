use bitcoin::bip32::Xpriv;
use bitcoin::io::Write;
use bitcoin::key::rand::Fill;
use bitcoin::Network;
use ddk::builder::Builder;
use ddk::oracle::kormir::KormirOracleClient;
use ddk::storage::postgres::PostgresStore;
use ddk::transport::nostr::NostrDlc;
use ddk::DlcDevKit;
use std::fs::{create_dir_all, File};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::sync::Arc;

use crate::common::settings::Settings;

type SonsOfLiberyDdk = DlcDevKit<NostrDlc, PostgresStore, KormirOracleClient>;

#[derive(Clone)]
pub struct SonsOfLiberty {
    pub dlcdevkit: Arc<SonsOfLiberyDdk>,
}

impl SonsOfLiberty {
    pub async fn new(settings: Settings) -> loco_rs::Result<Self> {
        let liberty_dir = match settings.data_dir {
            Some(dir) => PathBuf::from(dir),
            None => homedir::my_home()
                .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))?
                .ok_or(loco_rs::Error::string("Failed to get home directory"))?
                .join(".sons-of-liberty"),
        };

        let network = Network::from_str(&settings.network)
            .map_err(|_| loco_rs::Error::string("Invalid network"))?;

        let seed_bytes = xprv_from_path(&liberty_dir, network);

        let storage = Arc::new(
            PostgresStore::new(&settings.postgres_url, true, "sol".to_string())
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
        Ok(Self { dlcdevkit })
    }
}

/// Helper function that reads `[bitcoin::bip32::Xpriv]` bytes from a file.
/// If the file does not exist then it will create a file `seed.ddk` in the specified path.
pub fn xprv_from_path(path: &PathBuf, network: Network) -> Xpriv {
    if !path.exists() {
        create_dir_all(path).unwrap()
    }
    let seed_path = path.join("seed.ddk");
    let seed = if Path::new(&seed_path).exists() {
        let seed = std::fs::read(&seed_path).unwrap();
        let mut key = [0; 32];
        key.copy_from_slice(&seed);
        Xpriv::new_master(network, &seed).unwrap()
    } else {
        let mut file = File::create(&seed_path).unwrap();
        let mut entropy = [0u8; 32];
        entropy
            .try_fill(&mut bitcoin::key::rand::thread_rng())
            .unwrap();
        // let _mnemonic = Mnemonic::from_entropy(&entropy)?;
        let xprv = Xpriv::new_master(network, &entropy).unwrap();
        file.write_all(&entropy).unwrap();
        xprv
    };

    seed
}
