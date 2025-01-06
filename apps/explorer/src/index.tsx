import './fonts/index.css'
import '@/i18n'

import isPropValid from '@emotion/is-prop-valid'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { StyleSheetManager } from 'styled-components'

import NotificationBar from '@/components/NotificationBar'

import { SettingsProvider } from './contexts/settingsContext'
import { isFlexGapSupported } from './utils/browserSupport'

let browserIsOld = !isFlexGapSupported()

export const isHostGhPages = import.meta.env.BASE_URL.includes('explorer')

const Router = isHostGhPages ? HashRouter : BrowserRouter

try {
  BigInt(1)
} catch {
  browserIsOld = true
}

const container = document.getElementById('root')
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!)

if (browserIsOld) {
  root.render(
    <NotificationBar>
      Your browser version appears to be out of date. To use our app, please update your browser.
    </NotificationBar>
  )
} else {
  import('./App').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <Router>
          <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </StyleSheetManager>
        </Router>
      </StrictMode>
    )
  })
}

// See: https://styled-components.com/docs/faqs#shouldforwardprop-is-no-longer-provided-by-default
// This implements the default behavior from styled-components v5
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldForwardProp(propName: any, target: any) {
  if (typeof target === 'string') {
    // For HTML elements, forward the prop if it is a valid HTML attribute
    return isPropValid(propName)
  }
  // For other elements, forward all props
  return true
}
