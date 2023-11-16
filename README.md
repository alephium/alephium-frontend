# Alephium frontend

A monorepo containing all things frontend on Alephium.

## Development

We use [Bun](https://bun.sh/) as our package manager and [Turborepo](https://turbo.build/repo) as our build system. Turborepo runs the tasks defined in `turbo.json` and Bun installs the npm packages.

Install all dependencies with:

```shell
bun install
```

Turbo tasks are defined in `turbo.json`. You can execute them from the root directory of the monorepo:

```shell
turbo [task]
```

or from any workspace directory:

```shell
# equivalent to `turbo [task] --filter=[app]`
cd apps/[app]
turbo [task]
```

### Lint

```shell
turbo lint
turbo lint:fix
```

### Format

```shell
bun format
```

### Compile TypeScript

```shell
turbo typecheck
```

### Test

```shell
turbo test
```
