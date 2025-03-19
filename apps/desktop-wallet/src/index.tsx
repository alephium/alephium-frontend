import '@/index.css' // Importing CSS through CSS file to avoid font flickering
import '@/features/localization/i18n'

import { PersistQueryClientContextProvider } from '@alephium/shared-react'
import isPropValid from '@emotion/is-prop-valid'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import { StyleSheetManager } from 'styled-components'

import ApiContextProvider from '@/api/context/apiContext'
import App from '@/App'
import Tooltips from '@/components/Tooltips'
import AnalyticsProvider from '@/features/analytics/AnalyticsProvider'
import * as serviceWorker from '@/serviceWorker'
import { store } from '@/storage/store'
import { createTanstackIndexedDBPersister } from '@/storage/tanstackIndexedDBPersister'

const root = createRoot(document.getElementById('root')!)

root.render(
  <AnalyticsProvider>
    <StrictMode>
      <Provider store={store}>
        <Router>
          <Suspense fallback="loading">
            <StyleSheetManager shouldForwardProp={shouldForwardProp}>
              <PersistQueryClientContextProvider createPersister={createTanstackIndexedDBPersister}>
                <ApiContextProvider>
                  <App />
                </ApiContextProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </PersistQueryClientContextProvider>
              <Tooltips />
            </StyleSheetManager>
          </Suspense>
        </Router>
      </Provider>
    </StrictMode>
  </AnalyticsProvider>
)

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

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
