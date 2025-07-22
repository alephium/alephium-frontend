import './shim'
import '~/features/localization/i18n'
import './setupErrorHandling'
// Node polyfills to be removed when dependencies are updated
import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'
import 'react-native-quick-crypto'

import * as Sentry from '@sentry/react-native'
import { registerRootComponent } from 'expo'
import { enableFreeze } from 'react-native-screens'

enableFreeze(true)

import App from '~/App'

registerRootComponent(__DEV__ ? App : Sentry.wrap(App))
