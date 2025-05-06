use loco_rs::prelude::*;
use sea_orm::{DatabaseConnection, Statement};

pub struct Freshdb;

#[async_trait]
impl Task for Freshdb {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "freshdb".to_string(),
            detail: "Task to drop database tables conditionally".to_string(),
        }
    }

    async fn run(&self, app_context: &AppContext, vars: &task::Vars) -> Result<()> {
        println!("Conditionally wiping database tables...");

        // Get database connection
        let db = app_context.db.clone();

        // Parse variables with defaults (false if not provided)
        let drop_all = vars.cli.get("all").unwrap_or(&"false".to_string()) == "true";
        let drop_wallet =
            drop_all || vars.cli.get("wallet").unwrap_or(&"false".to_string()) == "true";
        let drop_seed = drop_all || vars.cli.get("seed").unwrap_or(&"false".to_string()) == "true";
        let drop_dlc = drop_all || vars.cli.get("dlc").unwrap_or(&"false".to_string()) == "true";

        // Execute drops based on conditions
        if drop_all {
            println!("Dropping ALL tables");
            drop_all_tables(&db).await?;
        } else {
            // Drop specific table categories based on flags
            if drop_wallet {
                println!("Dropping wallet-related tables");
                drop_wallet_tables(&db).await?;
            }

            if drop_seed {
                println!("Dropping seed-related tables");
                drop_seed_tables(&db).await?;
            }

            if drop_dlc {
                println!("Dropping DLC-related tables");
                drop_dlc_tables(&db).await?;
            }
        }

        println!("Database wipe completed successfully");
        Ok(())
    }
}

// Drop all tables in the database
async fn drop_all_tables(db: &DatabaseConnection) -> Result<()> {
    // List of all tables to drop
    let statements = vec![
        "DROP TABLE IF EXISTS _sqlx_migrations CASCADE",
        "DROP TABLE IF EXISTS anchor_tx CASCADE",
        "DROP TABLE IF EXISTS block CASCADE",
        "DROP TABLE IF EXISTS seeds CASCADE",
        "DROP TABLE IF EXISTS contracts CASCADE",
        "DROP TABLE IF EXISTS keychain CASCADE",
        "DROP TABLE IF EXISTS network CASCADE",
        "DROP TABLE IF EXISTS seaql_migrations CASCADE",
        "DROP TABLE IF EXISTS tx CASCADE",
        "DROP TABLE IF EXISTS txout CASCADE",
        "DROP TABLE IF EXISTS version CASCADE",
    ];

    // Execute each statement
    for sql in statements {
        let stmt = Statement::from_string(db.get_database_backend(), sql.to_owned());
        db.execute(stmt)
            .await
            .map_err(|e| Error::string(&format!("Failed to execute {}: {}", sql, e)))?;
    }

    Ok(())
}

// Drop wallet-related tables
async fn drop_wallet_tables(db: &DatabaseConnection) -> Result<()> {
    // List wallet-related tables
    let statements = vec![
        "DROP TABLE IF EXISTS keychain CASCADE",
        "DROP TABLE IF EXISTS tx CASCADE",
        "DROP TABLE IF EXISTS txout CASCADE",
    ];

    for sql in statements {
        let stmt = Statement::from_string(db.get_database_backend(), sql.to_owned());
        db.execute(stmt)
            .await
            .map_err(|e| Error::string(&format!("Failed to execute {}: {}", sql, e)))?;
    }

    Ok(())
}

// Drop seed-related tables
async fn drop_seed_tables(db: &DatabaseConnection) -> Result<()> {
    // List seed-related tables
    let statements = vec!["DROP TABLE IF EXISTS seeds CASCADE"];

    for sql in statements {
        let stmt = Statement::from_string(db.get_database_backend(), sql.to_owned());
        db.execute(stmt)
            .await
            .map_err(|e| Error::string(&format!("Failed to execute {}: {}", sql, e)))?;
    }

    Ok(())
}

// Drop DLC-related tables
async fn drop_dlc_tables(db: &DatabaseConnection) -> Result<()> {
    // List DLC-related tables
    let statements = vec![
        "DROP TABLE IF EXISTS contracts CASCADE",
        "DROP TABLE IF EXISTS anchor_tx CASCADE",
    ];

    for sql in statements {
        let stmt = Statement::from_string(db.get_database_backend(), sql.to_owned());
        db.execute(stmt)
            .await
            .map_err(|e| Error::string(&format!("Failed to execute {}: {}", sql, e)))?;
    }

    Ok(())
}
