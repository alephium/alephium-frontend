import * as Sentry from '@sentry/react-native'
import { Alert, Linking } from 'react-native'

if (!__DEV__) {
  Sentry.init({
    dsn: 'https://d369e561c12a0bbbbe1ba386854363ff@o4508131914874880.ingest.de.sentry.io/4508131917430864',
    appHangTimeoutInterval: 5,
    // See https://docs.sentry.io/platforms/react-native/configuration/filtering/
    beforeSend: (event) => {
      // See https://github.com/alephium/alephium-frontend/issues/927
      if (event.contexts?.device?.model?.includes('iPad Pro') && event.contexts?.device?.model_id?.includes('Mac')) {
        return null
      }

      return event
    }
  })

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('A global error occurred:', error)

    // See https://github.com/alephium/alephium-frontend/issues/972
    if (error.code != -32600) {
      Sentry.captureException(new Error(error), { data: { isFatal } })
    }

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
