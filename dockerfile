FROM rust:1.83.0-slim as builder

WORKDIR /usr/src/

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /usr/app

COPY --from=builder /usr/src/assets/static /usr/app/assets/static
COPY --from=builder /usr/src/assets/static/404.html /usr/app/assets/static/404.html
COPY --from=builder /usr/src/config /usr/app/config
COPY --from=builder /usr/src/target/release/sons_of_liberty-cli /usr/app/sons_of_liberty-cli

EXPOSE 5150

ENTRYPOINT ["/usr/app/sons_of_liberty-cli"]