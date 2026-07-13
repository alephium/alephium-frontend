const { withProjectBuildGradle, withAndroidManifest } = require('@expo/config-plugins')

// Detect if this is a final production release build on EAS
const isEasProduction = process.env.EAS_BUILD_PROFILE === 'production'

const withProjectGradleModifiers = (config) => {
  return withProjectBuildGradle(config, (modConfig) => {
    const sentryBypassBlock = `
// Automatically bypass Sentry source map uploads for local builds (Android Studio / local CLI)
// This ensures local profile/release testing passes, while EAS Build/CI still uploads safely.
allprojects {
    tasks.matching { it.name.contains("SentryUpload") }.all {
        onlyIf { System.getenv("CI") != null || System.getenv("EAS_BUILD") != null }
    }
}
`
    if (!modConfig.modResults.contents.includes('SentryUpload')) {
      modConfig.modResults.contents += sentryBypassBlock
    }
    return modConfig
  })
}

// 2. NEW: Injects the <profileable android:shell="true" /> tag into your production manifest
const withProfileableManifest = (config) => {
  return withAndroidManifest(config, (modConfig) => {
    const mainApplication = modConfig.modResults.manifest.application[0]
    if (!mainApplication['profileable']) {
      mainApplication['profileable'] = [
        {
          $: { 'android:shell': 'true' }
        }
      ]
    }
    return modConfig
  })
}

export default {
  expo: {
    name: 'Alephium',
    owner: 'alephium-dev',
    slug: 'alephium-mobile-wallet',
    version: '2.5.2',
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
      splash: {
        image: './assets/adaptive-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#000000'
      },
      allowBackup: false,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000'
      },
      // See https://github.com/alephium/alephium-frontend/issues/1021
      blockedPermissions: ['android.permission.READ_MEDIA_IMAGES', 'android.permission.READ_MEDIA_VIDEO'],
      permissions: ['android.permission.WRITE_SETTINGS'],
      package: 'org.alephium.wallet'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      withProjectGradleModifiers,
      !isEasProduction ? withProfileableManifest : null,
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
            flipper: false // https://docs.expo.dev/guides/using-flipper/
          },
          android: {
            javaVersion: 17,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: '36.0.0'
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
            './assets/fonts/Geist-Medium.ttf',
            './assets/fonts/Geist-SemiBold.ttf',
            './assets/fonts/Geist-Bold.ttf'
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
      ],
      ['expo-web-browser'],
      'react-native-capture-protection',
      '@react-native-vector-icons/lucide'
    ].filter(Boolean),
    extra: {
      eas: {
        projectId: '877a64af-ee97-4b79-8dfb-eddd78ebe065'
      }
    }
  }
}
