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

const CopyPrivateKeyConfirmationModal = memo(({ id, addressHash, ...props }: AddressModalProps) => {
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
    <CenteredModal title={t('Enter password')} id={id} skipFocusOnMount>
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
