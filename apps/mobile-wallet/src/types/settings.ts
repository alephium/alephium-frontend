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

import { ThemeType } from '~/style/themes'

export type Currency = 'CHF' | 'GBP' | 'EUR' | 'USD' | 'TRY' | 'VND' | 'RUB' | 'IDR'

export interface GeneralSettings {
  theme: ThemeType
  discreetMode: boolean
  requireAuth: boolean
  currency: Currency
  analytics: boolean
  analyticsId?: string
  walletConnect: boolean
  usesBiometrics: boolean
}

export interface NetworkSettings {
  networkId: number
  nodeHost: string
  explorerApiHost: string
  explorerUrl: string
}

export interface Settings {
  general: GeneralSettings
  network: NetworkSettings
}

export type SettingsKey = keyof Settings

export type SettingsPartial = GeneralSettings | NetworkSettings
