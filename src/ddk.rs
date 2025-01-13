use bitcoin::key::rand::Fill;
use bitcoin::Network;
use ddk::builder::Builder;
use ddk::oracle::kormir::KormirOracleClient;
use ddk::storage::sled::SledStorage;
use ddk::transport::lightning::LightningTransport;
use ddk::DlcDevKit;
use std::sync::Arc;

type SonsOfLiberyDdk = DlcDevKit<LightningTransport, SledStorage, KormirOracleClient>;

#[derive(Clone)]
pub struct SonsOfLiberty {
    pub dlcdevkit: Arc<SonsOfLiberyDdk>,
}

impl SonsOfLiberty {
    pub async fn new() -> Self {
        let mut seed_bytes = [0u8; 32];
        seed_bytes
            .try_fill(&mut bitcoin::key::rand::thread_rng())
            .unwrap();

        let liberty_dir = homedir::my_home()
            .unwrap()
            .unwrap()
            .join(".sons-of-liberty");

        let storage = Arc::new(SledStorage::new(liberty_dir.join("db").to_str().unwrap()).unwrap());

        let transport = Arc::new(LightningTransport::new(&seed_bytes, 1776).unwrap());
        let oracle = Arc::new(
            KormirOracleClient::new("https://kormir.dlcdevkit.com")
                .await
                .unwrap(),
        );

        let dlcdevkit = Arc::new(
            Builder::new()
                .set_esplora_host("http://localhost:30000".to_string())
                .set_network(Network::Signet)
                .set_name("sons-of-liberty")
                .set_seed_bytes(seed_bytes)
                .set_storage(storage.clone())
                .set_transport(transport.clone())
                .set_oracle(oracle.clone())
                .finish()
                .await
                .unwrap(),
        );
        Self { dlcdevkit }
    }
}
