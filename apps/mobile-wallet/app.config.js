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
    version: '1.0.5',
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
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000'
      },
      permissions: ['android.permission.FOREGROUND_SERVICE', 'android.permission.WAKE_LOCK'],
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
            compileSdkVersion: 33,
            targetSdkVersion: 33,
            buildToolsVersion: '33.0.0',
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
