# Alephium mobile wallet

The official Alephium mobile wallet.

## Development

Install depedencies from the root of the monorepo:

```shell
pnpminstall
```

Start a simulator or a physical device (after connecting with USB and enabling USB debugging):

```shell
pnpmios
# or
pnpmandroid
```

If you get an error `SDK location not found.` make sure the `ANDROID_SDK_ROOT` env var has the path to the Android SDK. For example, on macOS, you can run the following:

```shell
ANDROID_SDK_ROOT=/Users/<USERNAME>/Library/Android/sdk pnpmandroid
```

## EAS build/submit

### Android

#### Internal testing release on Google Play

In most cases, we'll need to build a production version and submitted to Google Play so that we can then decide to release it internally or later on promote the release to a production one through the Google Play Console.

```shell
eas build  --platform android --profile production
eas submit --platform android --profile internal
```

#### Creating an standalone APK

We will not need this very often, but still useful in some cases.

```shell
eas build --platform android --profile internal
```

### iOS

#### TestFlight

In most cases we want to release a TestFlight version so that we can have an open testing phase.

```shell
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

#### Internal release

Only registered iOS devices will get internal releases.

```shell
eas build --platform ios --profile internal
eas submit --platform ios --profile production
```
