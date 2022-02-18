# alephium-js

[![Github CI][test-badge]][test-link]
[![Code Coverage][coverage-badge]][coverage-link]
[![NPM][npm-badge]][npm-link]
[![code style: prettier][prettier-badge]][prettier-link]

A JavaScript/TypeScript library for building decentralized applications on the Alephium platform.

## Install

```
npm ci
```

## Development

### Update schemas

One first needs to update the version number of `alephium` and `explorer-backend` in `package.json`. Kindly note that one needs to check the compatibility of both OpenAPI files manually.

Typings can automatically generated using the following commands:

```shell
npm run fetch-schema:alephium
npm run fetch-schema:explorer
```

#### Examples

Fetching the latest schema of the testnet explorer-backend:

```shell
npm run fetch-schema:explorer -- -p https://testnet-backend.alephium.org/docs/explorer-backend-openapi.json
```

Fetching the latest schema of the locally running explorer-backend:

```shell
npm run fetch-schema:explorer -- -p http://localhost:9090/docs/explorer-backend-openapi.json
```

Fetch the latest schema of the locally running Alephium node:

```shell
npm run fetch-schema:alephium -- -p http://localhost:12973/docs/openapi.json
```

## Compile

Compile the TypeScript files into JavaScript:

```
npm run compile
```

## Testing

```
npm test
```

or, to watch for changes:

```
npm run test:watch
```

[test-badge]: https://github.com/alephium/alephium-js/actions/workflows/test.yml/badge.svg
[test-link]: https://github.com/alephium/alephium-js/actions/workflows/test.yml
[coverage-badge]: https://codecov.io/gh/alephium/alephium-js/branch/master/graph/badge.svg
[coverage-link]: https://codecov.io/gh/alephium/alephium-js
[npm-badge]: https://img.shields.io/npm/v/alephium-js.svg
[npm-link]: https://www.npmjs.org/package/alephium-js
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-link]: https://github.com/prettier/prettier
