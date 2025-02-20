import { keyring } from '@alephium/keyring'
import { getHumanReadableError } from '@alephium/shared'
import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { AddressModalProps } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { copiedToClipboard, copyToClipboardFailed } from '@/storage/global/globalActions'

const CopyPrivateKeyConfirmationModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  const copyPrivateKey = async () => {
    try {
      await navigator.clipboard.writeText(keyring.exportPrivateKeyOfAddress(addressHash))
      dispatch(copiedToClipboard(t('Private key copied.')))

      sendAnalytics({ event: 'Copied address private key' })
    } catch (error) {
      dispatch(copyToClipboardFailed(getHumanReadableError(error, t('Could not copy private key.'))))
      sendAnalytics({ type: 'error', message: 'Could not copy private key' })
    } finally {
      dispatch(closeModal({ id }))
    }
  }

  return (
    <CenteredModal title={t('Enter password')} id={id} skipFocusOnMount hasFooterButtons dynamicContent>
      <PasswordConfirmation
        text={t('Enter your password to copy the private key.')}
        buttonText={t('Copy private key')}
        onCorrectPasswordEntered={copyPrivateKey}
      >
        <InfoBox importance="alert" Icon={AlertTriangle}>
          {`${t('This is a feature for developers only.')} ${t(
            'You will not be able to recover your account with the private key!'
          )} ${t('Please, backup your secret phrase instead.')} ${t('Never disclose this key.')} ${t(
            'Anyone with your private keys can steal any assets held in your addresses.'
          )}`}
        </InfoBox>
      </PasswordConfirmation>
    </CenteredModal>
  )
})

export default CopyPrivateKeyConfirmationModal
