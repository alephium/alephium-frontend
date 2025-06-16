import { hashMessage, sign, SignMessageParams, SignMessageResult } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

interface SignMessageTxModalProps extends SignTxModalCommonProps {
  txParams: SignMessageParams
  unsignedData: string
  onSuccess: (signResult: SignMessageResult) => void
}

const SignMessageTxModal = memo(({ txParams, unsignedData, origin, onError, onSuccess }: SignMessageTxModalProps) => {
  const { t } = useTranslation()

  const { handleApprovePress, handleRejectPress } = useSignModal({
    onError,
    unsignedData,
    sign: async () => {
      const messageHash = hashMessage(txParams.message, txParams.messageHasher)
      const signature = sign(messageHash, await getAddressAsymetricKey(txParams.signerAddress, 'private'))

      sendAnalytics({ event: 'Approved message signing', props: { origin } })

      onSuccess({ signature })
    }
  })

  return (
    <BottomModal2 contentVerticalGap>
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
    </BottomModal2>
  )
})

export default SignMessageTxModal
