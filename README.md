# alephium-js

[![Github CI](https://github.com/alephium/alephium-js/actions/workflows/test.yml/badge.svg)](https://github.com/alephium/alephium-js/actions/workflows/test.yml) [![NPM](https://img.shields.io/npm/v/alephium-js.svg)](https://www.npmjs.org/package/alephium-js) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A JavaScript/TypeScript library for building decentralized applications on the Alephium platform.

## Install

```
npm ci
```

## Update schemas

Typings can automatically be fetched and built from the [node](https://github.com/alephium/alephium) and [explorer-backend](https://github.com/alephium/explorer-backend) OpenAPIs. You can use `npm run fetch-alephium-schema` and `npm run fetch-explorer-schema` respectively and pass the URL to the Swagger file using the `-p` flag. See following examples.

### Examples

Fetching the latest schema of the testnet explorer-backend:

```
npm run fetch-explorer-schema -- -p https://testnet-backend.alephium.org/docs/explorer-backend-openapi.json
```

When developing locally, you can point towards your localhost service to fetch the latest schemas:

```
npm run fetch-explorer-schema -- -p http://localhost:9090/docs/explorer-backend-openapi.json
```

## Compile

Compile the TypeScript files into JavaScript:

```
npm run compile
```

## Testing

```
npm run test
```
