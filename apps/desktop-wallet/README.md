# Alephium desktop wallet

The official Alephium desktop wallet.

![Wallet preview](https://user-images.githubusercontent.com/1579899/236201682-4e0b0c45-65d3-42c0-b187-d8d6387426d7.png)

## Development

Start by following the development instructions in the [README](../../README.md) of the monorepo.

Then, to start the electron app, run:

```shell
pnpm start
```

## Packaging

Based on your OS run the appropriate command:

```shell
pnpm ci:build:electron:windows
pnpm ci:build:electron:macOS
pnpm ci:build:electron:linux
pnpm ci:build:electron:linux:arm64
```
