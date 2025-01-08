import { dismissBrowser } from 'expo-web-browser'

const CLOSE_BANXA_TAB_DEEP_LINK = 'alephium://close-banxa-tab'

export const closeBanxaTabOnDeepLink = (event: { url: string }) => {
  if (event.url.includes(CLOSE_BANXA_TAB_DEEP_LINK)) {
    dismissBrowser()
  }
}
