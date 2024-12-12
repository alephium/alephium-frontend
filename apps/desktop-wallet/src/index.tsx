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

import '@/index.css' // Importing CSS through CSS file to avoid font flickering
import '@/i18n'
import '@yaireo/tagify/dist/tagify.css' // Tagify CSS: important to import after index.css file

import isPropValid from '@emotion/is-prop-valid'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import { StyleSheetManager } from 'styled-components'

import ApiContextProvider from '@/api/context/apiContext'
import { PersistQueryClientContextProvider } from '@/api/persistQueryClientContext'
import App from '@/App'
import Tooltips from '@/components/Tooltips'
import AnalyticsProvider from '@/features/analytics/AnalyticsProvider'
import * as serviceWorker from '@/serviceWorker'
import { store } from '@/storage/store'

// The app still behaves as if React 17 is used. This is because
// `react-custom-scrollbars` is not working with React 18 yet.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// const root = createRoot(document.getElementById('root')!)

ReactDOM.render(
  <AnalyticsProvider>
    <StrictMode>
      <Provider store={store}>
        <Router>
          <Suspense fallback="loading">
            <StyleSheetManager shouldForwardProp={shouldForwardProp}>
              <PersistQueryClientContextProvider>
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
  </AnalyticsProvider>,
  document.getElementById('root')
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
