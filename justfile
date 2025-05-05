psql:
  - psql -d postgres://loco:loco@localhost:5432/sons-of-liberty_development

dev:
  - ESPLORA_HOST=http://electrs:30000 DATABASE_URL=postgres://loco:loco@postgres-sol:5432/sons-of-liberty_development docker compose -f docker/docker-compose.yaml --profile development up -d

stop:
  - docker compose -f docker/docker-compose.yaml --profile development down

bc *args:
  - docker exec bitcoin bitcoin-cli --rpcport=18443 --rpcuser=ddk --rpcpassword=ddk -rpcwallet=ddk {{args}}
