use async_trait::async_trait;
use axum::{Extension, Router as AxumRouter};
use loco_rs::{
    app::{AppContext, Hooks, Initializer},
    bgworker::{BackgroundWorker, Queue},
    boot::{create_app, BootResult, StartMode},
    config::Config,
    controller::AppRoutes,
    db::{self, truncate_table},
    environment::Environment,
    task::Tasks,
    Result,
};
use migration::Migrator;
use std::{path::Path, sync::Arc};
use tokio::sync::OnceCell;
use tower_cookies::CookieManagerLayer;

use crate::{common::settings::Settings, sol::SonsOfLiberty};
#[allow(unused_imports)]
use crate::{
    controllers, initializers, models::_entities::users, tasks, workers::downloader::DownloadWorker,
};

pub static SONS_OF_LIBERTY: OnceCell<Arc<SonsOfLiberty>> = OnceCell::const_new();

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(
        mode: StartMode,
        environment: &Environment,
        config: Config,
    ) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment, config).await
    }

    async fn initializers(_ctx: &AppContext) -> Result<Vec<Box<dyn Initializer>>> {
        Ok(vec![Box::new(
            initializers::view_engine::ViewEngineInitializer,
        )])
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes() // controller routes below
            .add_route(controllers::home::routes())
            .add_route(controllers::wallet::routes())
            .add_route(controllers::peers::routes())
            .add_route(controllers::contracts::routes())
            .add_route(controllers::offers::routes())
            .add_route(controllers::info::routes())
            .add_route(controllers::balance::routes())
            .add_route(controllers::auth::routes())
    }

    async fn after_routes(router: AxumRouter, ctx: &AppContext) -> Result<AxumRouter> {
        let settings = match &ctx.config.settings {
            Some(settings) => {
                let settings = Settings::from_json(&settings)?;
                tracing::info!("Settings: {:?}", settings);
                settings
            }
            None => Settings::default(),
        };

        let ddk = SONS_OF_LIBERTY
            .get_or_init(|| async {
                tracing::warn!("Initializing DDK");
                Arc::new(
                    SonsOfLiberty::new(settings)
                        .await
                        .expect("Failed to initialize DDK"),
                )
            })
            .await;

        let ddk_task = ddk.clone();
        tokio::spawn(async move {
            if let Err(e) = ddk_task.dlcdevkit.start() {
                tracing::error!("Error starting DDK: {:?}", e);
            }
        });
        Ok(router
            .layer(Extension(ddk.clone()))
            .layer(CookieManagerLayer::new()))
    }

    async fn on_shutdown(_ctx: &AppContext) {
        if let Some(state) = SONS_OF_LIBERTY.get() {
            tracing::info!("Stopping DDK");
            state.dlcdevkit.stop().unwrap();
        }
    }

    async fn connect_workers(ctx: &AppContext, queue: &Queue) -> Result<()> {
        queue.register(DownloadWorker::build(ctx)).await?;
        Ok(())
    }

    #[allow(unused_variables)]
    fn register_tasks(tasks: &mut Tasks) {
        tasks.register(tasks::balance_updater::BalanceUpdater);
        // tasks-inject (do not remove)
    }
    async fn truncate(ctx: &AppContext) -> Result<()> {
        truncate_table(&ctx.db, users::Entity).await?;
        Ok(())
    }
    async fn seed(ctx: &AppContext, base: &Path) -> Result<()> {
        db::seed::<users::ActiveModel>(&ctx.db, &base.join("users.yaml").display().to_string())
            .await?;
        Ok(())
    }
}
