/*
Copyright 2018 - 2022 The Alephium Authors
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

import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { deleteWallet } from '~/persistent-storage/wallet'
import { walletDeleted } from '~/store/wallet/walletActions'
import { resetNavigationState } from '~/utils/navigation'

const WalletDeleteModal = (props: ModalContentProps) => {
  const dispatch = useAppDispatch()
  const posthog = usePostHog()
  const walletName = useAppSelector((s) => s.wallet.name)
  const [inputWalletName, setInputWalletName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteConfirmPress = async () => {
    setIsLoading(true)

    await deleteWallet()

    setIsLoading(false)

    resetNavigationState('LandingScreen')

    dispatch(walletDeleted())
    posthog?.capture('Deleted wallet')
  }

  return (
    <>
      <ModalContent verticalGap {...props}>
        <ScreenSection>
          <BottomModalScreenTitle>⚠️ Delete &quot;{walletName}&quot;?</BottomModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            Do you really want to delete this wallet?
          </AppText>
          <AppText color="secondary" size={18}>
            If so, please enter the wallet name below, and hit the delete button.
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Input label="Wallet name" value={inputWalletName} onChangeText={(value) => setInputWalletName(value)} />
        </ScreenSection>
        <ScreenSection>
          <Button
            title="Delete"
            variant="alert"
            onPress={handleDeleteConfirmPress}
            disabled={inputWalletName !== walletName}
          />
        </ScreenSection>
      </ModalContent>
      <SpinnerModal isActive={isLoading} />
    </>
  )
}

export default WalletDeleteModal
