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

import './fonts/index.css'
import '@/i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'

import NotificationBar from '@/components/NotificationBar'

import { SettingsProvider } from './contexts/settingsContext'
import * as serviceWorker from './serviceWorker'
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
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </Router>
      </StrictMode>
    )
  })
}

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
