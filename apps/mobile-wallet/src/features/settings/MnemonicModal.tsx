import { AnalyticsEvent } from '@alephium/shared'
import { memo, useEffect, useState } from 'react'

import { sendAnalytics } from '~/analytics'
import i18n from '~/features/localization/i18n'
import BottomModal from '~/features/modals/BottomModal'
import OrderedTable from '~/features/settings/OrderedTable'
import { useAppSelector } from '~/hooks/redux'
import usePreventScreenCapture from '~/hooks/usePreventScreenCapture'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/walletMnemonic'
import { showExceptionToast } from '~/utils/layout'

const MnemonicModal = memo(() => {
  const walletId = useAppSelector((s) => s.wallet.id)

  const [mnemonicWords, setMnemonicWords] = useState<string[]>()

  useEffect(() => {
    dangerouslyExportWalletMnemonic(walletId)
      .then((mnemonic) => {
        setMnemonicWords(mnemonic.split(' '))

        sendAnalytics({ event: AnalyticsEvent.RECOVERY_PHRASE_SHOWN, props: { origin: 'settings' } })
      })
      .catch((error) => {
        const message = 'Could not export mnemonic'

        showExceptionToast(error, i18n.t(message))
        sendAnalytics({ type: 'error', error, message, isSensitive: true })
      })
  }, [walletId])

  usePreventScreenCapture()

  return (
    <BottomModal contentVerticalGap>
      <OrderedTable items={mnemonicWords ?? []} />
    </BottomModal>
  )
})

export default MnemonicModal
