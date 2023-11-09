# Alephium frontend

A monorepo containing all things frontend on Alephium.

## Development

We use [Bun](https://bun.sh/) as our package manager and [Turborepo](https://turbo.build/repo) as our build system.

### Lint

```
turbo lint
turbo lint:fix
```

### Format

```
bun format
```

### Compile TypeScript

```
turbo ts:check
```

### Build

```
turbo run build
```

### Test

```
turbo test
```
