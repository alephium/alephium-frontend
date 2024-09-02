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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalContent, ModalContentProps } from '~/features/modals/ModalContent'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { deleteWallet } from '~/persistent-storage/wallet'
import { walletDeleted } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'

interface WalletDeleteModalProps extends ModalContentProps {
  onDelete: () => void
}

const WalletDeleteModal = ({ onDelete, ...props }: WalletDeleteModalProps) => {
  const dispatch = useAppDispatch()
  const walletName = useAppSelector((s) => s.wallet.name)
  const { resetWalletConnectStorage } = useWalletConnectContext()
  const { t } = useTranslation()

  const [inputWalletName, setInputWalletName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteConfirmPress = async () => {
    props.onClose && props.onClose()

    setIsLoading(true)

    try {
      await deleteWallet()

      onDelete()

      dispatch(walletDeleted())
      resetWalletConnectStorage()
      sendAnalytics({ event: 'Deleted wallet' })
    } catch (error) {
      showExceptionToast(error, t('Error while deleting wallet'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ModalContent verticalGap {...props}>
        <ScreenSection>
          <ModalScreenTitle>⚠️ {t('Delete "{{ walletName }}"?', { walletName })}</ModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            {t('Do you really want to delete this wallet from your device?')}
          </AppText>
          <AppText color="secondary" size={18}>
            {t('You can always restore it later using your secret recovery phrase.')}
          </AppText>
          <AppText color="secondary" size={18}>
            {t('If so, please enter the wallet name below, and hit the delete button.')}
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Input label={t('Wallet name')} value={inputWalletName} onChangeText={setInputWalletName} />
        </ScreenSection>
        <ScreenSection>
          <Button
            title={t('Delete')}
            variant="alert"
            onPress={handleDeleteConfirmPress}
            disabled={inputWalletName !== walletName}
            iconProps={{ name: 'trash' }}
          />
        </ScreenSection>
      </ModalContent>
      <SpinnerModal isActive={isLoading} />
    </>
  )
}

export default WalletDeleteModal
