use serde::{Deserialize, Serialize};

// TODO
// policies
// start up peers
// wallet sync time?
// periodic sync time?
// ip address fence range

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Settings {
    pub data_dir: Option<String>,
    pub listening_port: u16,
    pub kormir_host: String,
    pub esplora_host: String,
    #[serde(default = "default_network")]
    pub network: String,
    pub name: String,
}

fn default_network() -> String {
    "regtest".to_string()
}

impl Settings {
    pub fn from_json(value: &serde_json::Value) -> loco_rs::Result<Self> {
        serde_json::from_value(value.clone())
            .map_err(|e| loco_rs::Error::string(e.to_string().as_str()))
    }
}
