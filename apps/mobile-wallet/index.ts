import './shim'
import '~/features/localization/i18n'
import './setupErrorHandling'

import * as Sentry from '@sentry/react-native'
import { registerRootComponent } from 'expo'
import { enableFreeze } from 'react-native-screens'

enableFreeze(true)

import App from '~/App'

registerRootComponent(__DEV__ ? App : Sentry.wrap(App))
