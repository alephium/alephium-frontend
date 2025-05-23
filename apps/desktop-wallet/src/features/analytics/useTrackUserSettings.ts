import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppSelector } from '@/hooks/redux'
import { currentVersion } from '@/utils/app-data'

const useTrackUserSettings = () => {
  const posthog = usePostHog()
  const nbOfWallets = useAppSelector((s) => s.global.wallets.length)
  const theme = useAppSelector((s) => s.settings.theme)
  const devTools = useAppSelector((s) => s.settings.devTools)
  const walletLockTimeInMinutes = useAppSelector((s) => s.settings.walletLockTimeInMinutes)
  const language = useAppSelector((s) => s.settings.language)
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const network = useAppSelector((s) => s.network.name)
  const region = useAppSelector((s) => s.settings.region)

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
        network,
        region
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
    region,
    theme,
    walletLockTimeInMinutes
  ])
}

export default useTrackUserSettings
