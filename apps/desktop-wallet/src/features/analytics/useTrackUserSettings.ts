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

import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

import { useAppSelector } from '@/hooks/redux'
import { currentVersion } from '@/utils/app-data'

const useTrackUserSettings = () => {
  const posthog = usePostHog()
  const nbOfWallets = useAppSelector((s) => s.global.wallets.length)
  const theme = useAppSelector((s) => s.settings.theme)
  const devTools = useAppSelector((s) => s.settings.devTools)
  const walletLockTimeInMinutes = useAppSelector((s) => s.settings.walletLockTimeInMinutes)
  const language = useAppSelector((s) => s.settings.language)
  const passwordRequirement = useAppSelector((s) => s.settings.passwordRequirement)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const network = useAppSelector((s) => s.network.name)

  useEffect(() => {
    if (posthog.__loaded)
      posthog.people.set({
        desktop_wallet_version: currentVersion,
        wallets: nbOfWallets,
        lockTimeInMs: walletLockTimeInMinutes,
        theme,
        devTools,
        language,
        passwordRequirement,
        fiatCurrency,
        network
      })
  }, [
    devTools,
    fiatCurrency,
    language,
    nbOfWallets,
    network,
    passwordRequirement,
    posthog.__loaded,
    posthog.people,
    theme,
    walletLockTimeInMinutes
  ])
}

export default useTrackUserSettings
