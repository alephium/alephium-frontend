# Alephium mobile wallet

The official Alephium mobile wallet.

## Development

Install depedencies:

```shell
npm i
```

Install the [Development Client app](development-build.apk) on your Android device (replacement of the Expo Go mobile app).

Start developer tools:

```shell
npm start
```

Launch the Development Client app on your phone and enter the URL you see on your terminal (you can scan the QR code to get the URL).

### Creating development build

```shell
eas login
```

Build a development client app (replacement of Expo Go) for local development (useful when installing native modules or upgrading them):

```shell
eas build -p android --profile preview
```

Build a production preview apk for Android:

```shell
eas build --profile development --platform android
```

## Debugging

To be able to inspect the DOM tree as well as the Redux state with React Native Debugger while using a development client, you need to shake the phone, tap on "Open React Native dev menu" and select "Debug".

### Running on Android with USB debugging

```shell
npm run android
```

If you get an error `SDK location not found.` make sure the `ANDROID_SDK_ROOT` env var has the path to the Android SDK. For example, on macOS, you can run the following:

```shell
ANDROID_SDK_ROOT=/Users/<USERNAME>/Library/Android/sdk npm run android
```
