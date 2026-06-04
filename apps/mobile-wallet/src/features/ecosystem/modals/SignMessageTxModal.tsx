import { SignMessageTxModalProps } from '@alephium/shared'
import { hashMessage, sign } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalDestinationDappRow from '~/features/ecosystem/modals/SignModalDestinationDappRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal from '~/features/modals/BottomModal'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const SignMessageTxModal = memo(
  ({ txParams, unsignedData, dAppUrl, dAppIcon, origin, onError, onSuccess }: SignMessageTxModalProps) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const walletId = useAppSelector((s) => s.wallet.id)

    const { handleApprovePress, handleRejectPress } = useSignModal({
      onError,
      dAppUrl,
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

            {dAppUrl && <SignModalDestinationDappRow dAppUrl={dAppUrl} dAppIcon={dAppIcon} />}

            <Row isVertical title={t('Message')} titleColor="secondary">
              <AppText>{txParams.message}</AppText>
            </Row>
          </Surface>

          <InfoBox
            narrow
            title={t('Warning')}
            iconName="alert-triangle"
            iconColor={theme.global.alert}
            style={{ marginTop: DEFAULT_MARGIN }}
          >
            <AppText color="secondary">
              {t(
                'Only sign messages on sites you trust. A signature can be used to prove you own this address or to authorize actions.'
              )}
            </AppText>
          </InfoBox>
        </ScreenSection>

        <SignTxModalFooterButtonsSection
          onReject={handleRejectPress}
          onApprove={handleApprovePress}
          approveButtonTitle={t('Sign')}
        />
      </BottomModal>
    )
  }
)

export default SignMessageTxModal
