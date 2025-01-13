use sons_of_liberty::app::App;
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_get_balances() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/balances/").await;
        assert_eq!(res.status_code(), 200);

        // you can assert content like this:
        // assert_eq!(res.text(), "content");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_list() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/balances/list").await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

