# Alephium mobile wallet

The official Alephium mobile wallet.

## Development

Install depedencies from the root of the monorepo:

```shell
bun install
```

Start a simulator or a physical device (after connecting with USB and enabling USB debugging):

```shell
bun ios
# or
bun android
```

If you get an error `SDK location not found.` make sure the `ANDROID_SDK_ROOT` env var has the path to the Android SDK. For example, on macOS, you can run the following:

```shell
ANDROID_SDK_ROOT=/Users/<USERNAME>/Library/Android/sdk bun android
```
