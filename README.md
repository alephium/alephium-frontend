# Install

```
npm ci
```

# Fetch schemas (types) from backend services
Typings can automatically be fetched and built from the [node](https://github.com/alephium/alephium) and [explorer-backend](https://github.com/alephium/explorer-backend) OpenAPIs. You can use `npm run fetch-alephium-schema` and `npm run fetch-explorer-schema` respectively. 

Don't forget to define the path to the swagger file, by using the `-p` flag.

## Example (testnet)

```
npm run fetch-explorer-schema -- -p https://testnet-backend.alephium.org/docs/explorer-backend-openapi.json

```

When doing some local development, you can point towards your localhost service to fetch the latest schemas:

```
npm run fetch-explorer-schema -- -p http://localhost:9090/docs/explorer-backend-openapi.json
```

# Compile

Compile the typescript files into javascript.

```
npm run compile
```

# Testing

```
npm run test
```
