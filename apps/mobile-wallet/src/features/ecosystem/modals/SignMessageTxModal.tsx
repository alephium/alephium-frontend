import { SignMessageTxModalProps } from '@alephium/shared'
import { hashMessage, sign } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal from '~/features/modals/BottomModal'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'

const SignMessageTxModal = memo(({ txParams, unsignedData, origin, onError, onSuccess }: SignMessageTxModalProps) => {
  const { t } = useTranslation()
  const walletId = useAppSelector((s) => s.wallet.id)

  const { handleApprovePress, handleRejectPress } = useSignModal({
    onError,
    type: 'MESSAGE',
    sign: async () => {
      const messageHash = hashMessage(txParams.message, txParams.messageHasher)
      const signature = sign(messageHash, await getAddressAsymetricKey(walletId, txParams.signerAddress, 'private'))

      sendAnalytics({ event: 'Approved message signing', props: { origin } })

      onSuccess({ signature })
    }
  })

  return (
    <BottomModal contentVerticalGap>
      <ScreenSection>
        <Surface>
          <Row title={t('Signing with')} titleColor="secondary">
            <AddressBadge addressHash={txParams.signerAddress} />
          </Row>

          <Row isVertical title={t('Message')} titleColor="secondary">
            <AppText>{txParams.message}</AppText>
          </Row>
        </Surface>
      </ScreenSection>

      <SignTxModalFooterButtonsSection
        onReject={handleRejectPress}
        onApprove={handleApprovePress}
        approveButtonTitle={t('Sign')}
      />
    </BottomModal>
  )
})

export default SignMessageTxModal
