import { AnalyticsEvent } from '@alephium/shared'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { useAppDispatch } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import { runMultiWalletMigrationIfNeeded } from '~/persistent-storage/migrations/multiWalletMigration'
import { validateAndRepairStoredWalletData } from '~/persistent-storage/walletValidation'
import { metadataRestored } from '~/store/wallet/walletSlice'
import { showToast } from '~/utils/layout'

const useShowAppContentAfterValidatingStoredWalletData = () => {
  const [state, setState] = useState({ showAppContent: false, wasMetadataRestored: false })
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { data: validationResult } = useAsyncData(
    useCallback(async () => {
      await runMultiWalletMigrationIfNeeded()

      return validateAndRepairStoredWalletData()
    }, [])
  )

  useEffect(() => {
    if (!validationResult) return

    if (validationResult.status === 'valid') {
      if (validationResult.warning) {
        sendAnalytics({ type: 'error', message: validationResult.warning })
      }
      setState({ showAppContent: true, wasMetadataRestored: false })
    } else if (validationResult.status === 'invalid') {
      showToast({
        text1: t('Could not unlock app'),
        text2: t(
          validationResult.error === 'Could not find mnemonic for existing wallet metadata'
            ? 'Missing encrypted mnemonic'
            : 'Wallet metadata not found'
        ),
        type: 'error',
        autoHide: false
      })
      sendAnalytics({ type: 'error', message: validationResult.error })
    } else if (validationResult.status === 'needs-restore') {
      Alert.alert(
        t('Restore data'),
        t(
          validationResult.appWasUninstalled
            ? 'We noticed that you deleted the app, would you like to restore your last wallet?'
            : "Due to an unexpected error some of your app's data are missing. Would you like to regenerate them? Your funds are safe."
        ),
        [
          {
            text: t('No'),
            onPress: () => setState({ showAppContent: true, wasMetadataRestored: false })
          },
          {
            text: t('Yes'),
            onPress: async () => {
              const success = await validationResult.restoreWallet()

              if (success) {
                showToast({ text1: t('App data were reset'), type: 'success' })
                sendAnalytics({ event: AnalyticsEvent.RECREATED_MISSING_WALLET_METADATA_FOR_EXISTING_WALLET })
              } else {
                showToast({
                  text1: t('Could not unlock app'),
                  text2: t('Wallet metadata not found'),
                  type: 'error',
                  autoHide: false
                })
                sendAnalytics({
                  type: 'error',
                  message: 'Could not recreate missing wallet metadata for existing wallet'
                })
              }

              setState({ showAppContent: true, wasMetadataRestored: success })
              dispatch(metadataRestored())
            }
          }
        ]
      )
    }
  }, [dispatch, t, validationResult])

  return state
}

export default useShowAppContentAfterValidatingStoredWalletData
