pub mod auth;

pub mod balance;
pub mod contracts;
pub mod info;
pub mod offers;
pub mod peers;
pub mod wallet;

// This is an example of how to nest routes.
// fn routes() -> Vec<Routes> {
//     AppRoutes::with_default_routes()
//         .prefix("/client/")
//         .add_route(wallet::routes())
//         .get_routes()
//         .to_vec()
// }

pub mod create;
pub mod hashrate;
pub mod nostr;

pub mod sync;