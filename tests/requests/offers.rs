use loco_rs::testing::prelude::*;
use serial_test::serial;
use sons_of_liberty::app::App;

#[tokio::test]
#[serial]
async fn can_get_offers() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/offers/").await;
        assert_eq!(res.status_code(), 200);

        // you can assert content like this:
        // assert_eq!(res.text(), "content");
    })
    .await;
}
