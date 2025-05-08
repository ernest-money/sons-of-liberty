psql:
  - psql -d postgres://loco:loco@localhost:5432/sons-of-liberty_development

freshdb:
  - cargo loco task freshdb all:true

scheduler:
  - cargo loco scheduler --config config/scheduler.development.yaml -e development --tag sol

dev:
  - ESPLORA_HOST=http://electrs:30000 DATABASE_URL=postgres://loco:loco@postgres-sol:5432/sons-of-liberty_development docker compose -f docker/docker-compose.yaml --profile development up -d

signet:
  - ESPLORA_HOST=https://mutinynet.com/api/v1/ ORACLE_HOST=https://oracle.ernest.money NETWORK=signet NAME=signet_sons-of-liberty DATABASE_URL=postgres://loco:loco@postgres-sol:5432/sons-of-liberty_development cargo loco start

stop:
  - docker compose -f docker/docker-compose.yaml --profile development down

bc *args:
  - docker exec bitcoin bitcoin-cli --rpcport=18443 --rpcuser=ddk --rpcpassword=ddk -rpcwallet=ddk {{args}}
