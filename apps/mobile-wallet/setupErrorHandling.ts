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
    dsn: 'https://d369e561c12a0bbbbe1ba386854363ff@o4508131914874880.ingest.de.sentry.io/4508131917430864'
  })

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('A global error occurred:', error)

    Sentry.captureException(error, { data: { isFatal } })

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
