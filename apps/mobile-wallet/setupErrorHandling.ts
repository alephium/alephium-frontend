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

import * as Sentry from '@sentry/react-native'
import { Alert, Linking } from 'react-native'

if (!__DEV__) {
  Sentry.init({
    dsn: 'https://d369e561c12a0bbbbe1ba386854363ff@o4508131914874880.ingest.de.sentry.io/4508131917430864',
    appHangTimeoutInterval: 5,
    // See https://docs.sentry.io/platforms/react-native/configuration/filtering/
    beforeSend: (event, hint) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error: any = hint?.originalException

      if (
        // See https://github.com/alephium/alephium-frontend/issues/927
        (event.contexts?.device?.model?.includes('iPad Pro') && event.contexts?.device?.model_id?.includes('Mac')) ||
        // See https://github.com/alephium/alephium-frontend/issues/972
        (error && typeof error === 'object' && error?.code === -32600) ||
        // See https://github.com/alephium/alephium-frontend/issues/927
        event?.exception?.values?.[0]?.type === 'AppHanging'
      ) {
        return null
      }

      return event
    }
  })

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('A global error occurred:', error)

    Sentry.captureException(new Error(error), { data: { isFatal } })

    const url = `mailto:developer@alephium.org?subject=Crash report&body=${error}`

    Alert.alert('An error occurred', 'We are working on fixing this.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send report',
        onPress: () => Linking.canOpenURL(url).then((result) => (result ? Linking.openURL(url) : false))
      }
    ])
  })
}
