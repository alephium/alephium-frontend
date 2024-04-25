/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

export default {
  expo: {
    name: 'Alephium',
    owner: 'alephium-dev',
    slug: 'alephium-mobile-wallet',
    version: '1.0.10',
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
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'org.alephium.mobilewallet',
      infoPlist: {
        BGTaskSchedulerPermittedIdentifiers: ['$(PRODUCT_BUNDLE_PACKAGE_TYPE)']
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
      permissions: [
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
        'android.permission.WAKE_LOCK'
      ],
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
            deploymentTarget: '13.4',
            newArchEnabled: false,
            flipper: false // https://docs.expo.dev/guides/using-flipper/
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
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
        'expo-barcode-scanner',
        {
          cameraPermission:
            'The app requires access to your camera to scan QR codes for sending transactions, connecting to WalletConnect and importing a wallet.'
        }
      ],
      'expo-localization',
      'expo-secure-store'
    ],
    extra: {
      eas: {
        projectId: '877a64af-ee97-4b79-8dfb-eddd78ebe065'
      }
    }
  }
}
