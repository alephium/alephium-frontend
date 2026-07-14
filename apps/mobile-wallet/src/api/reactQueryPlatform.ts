import NetInfo from '@react-native-community/netinfo'
import { focusManager, onlineManager } from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'

// React Native never fires the browser focus/online events these managers default to, so without this the app is
// permanently treated as focused and online. See https://tanstack.com/query/latest/docs/framework/react/react-native

onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((state) => setOnline(!!state.isConnected)))

AppState.addEventListener('change', (status) => {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
})
