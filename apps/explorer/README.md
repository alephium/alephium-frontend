# Alephium Explorer - frontend

A blockchain explorer frontend for Alephium.

## Features

- Switch between main and test networks
- Search for an address or transaction
- List blocks
  - Hash, timestamp, height, number of TX, and chain index
- Transaction view
  - Hash, status, block hash, timestamp, inputs, outputs, gas, TX fee
- Address view
  - Address, number of transactions, total balance, locked balance, history
- Statistics
  - Hashrate, supply, transactions, blocks, number of chains

## Development

Start by following the development instructions in the [README](/README.md) of the monorepo.

Then, create an `.env` file following the template and add values the environmental variables. You can use our [public services](https://docs.alephium.org/dapps/public-services) or your local servers.

```shell
cp .env.example .env
```

Then, start the app:

```shell
pnpm start
```

## Releasing

Follow the same [instructions as in the desktop wallet](../desktop-wallet/README.md). The only difference is that pushing a production tag will trigger the workflow to build and publish the Docker image. It will not deploy the explorer frontend to production. This is done by manually triggering the corresponding workflow from the GitHub interface.
