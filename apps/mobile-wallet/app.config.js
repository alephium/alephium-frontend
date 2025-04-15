export default {
  expo: {
    name: 'Alephium',
    owner: 'alephium-dev',
    slug: 'alephium-mobile-wallet',
    version: '2.1.3',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: ['wc', 'alephium'],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'org.alephium.mobilewallet',
      infoPlist: {
        BGTaskSchedulerPermittedIdentifiers: ['$(PRODUCT_BUNDLE_IDENTIFIER)'],
        LSMinimumSystemVersion: '12.0'
      },
      config: {
        usesNonExemptEncryption: false
      },
      // The following config was added due to: https://github.com/alephium/alephium-frontend/issues/489.
      // The privacy manifests config should probably need to be removed once all of our deps that are using native APIs
      // that require a privacy manifest have been updated to include one, and expo has been updated to allow updating
      // to these versions. See https://github.com/alephium/alephium-frontend/pull/534 for more info.
      //
      // For further info into what each NSPrivacyAccessedAPITypeReasons refers to, see:
      // https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1']
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
            NSPrivacyAccessedAPITypeReasons: ['E174.1']
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1']
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1']
          }
        ]
      }
    },
    android: {
      allowBackup: false,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000'
      },
      // See https://github.com/alephium/alephium-frontend/issues/1021
      blockedPermissions: ['android.permission.READ_MEDIA_IMAGES', 'android.permission.READ_MEDIA_VIDEO'],
      package: 'org.alephium.wallet'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
            newArchEnabled: false,
            flipper: false // https://docs.expo.dev/guides/using-flipper/
          },
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
            newArchEnabled: false
          }
        }
      ],
      [
        'expo-camera',
        {
          cameraPermission:
            'The app requires access to your camera to scan QR codes for sending transactions, connecting to WalletConnect and importing a wallet.'
        }
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Inter18pt-Medium.ttf',
            './assets/fonts/Inter18pt-SemiBold.ttf',
            './assets/fonts/Inter18pt-Bold.ttf'
          ]
        }
      ],
      'expo-localization',
      'expo-secure-store',
      'expo-video',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'alephium-mobile-wallet',
          organization: 'alephium'
        }
      ]
    ],
    extra: {
      eas: {
        projectId: '877a64af-ee97-4b79-8dfb-eddd78ebe065'
      }
    }
  }
}
