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

import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { updateStoredWalletMetadata } from '~/persistent-storage/wallet'
import { walletNameChanged } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'

interface EditWalletNameScreenProps
  extends StackScreenProps<RootStackParamList, 'EditWalletNameScreen'>,
    ScrollScreenProps {}

const EditWalletNameScreen = ({ navigation, headerOptions, ...props }: EditWalletNameScreenProps) => {
  const walletName = useAppSelector((s) => s.wallet.name)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [name, setName] = useState(walletName)
  const [loading, setLoading] = useState(false)

  const handleSavePress = async () => {
    setLoading(true)

    try {
      await updateStoredWalletMetadata({ name })
      dispatch(walletNameChanged(name))

      sendAnalytics({ event: 'Wallet: Editted wallet name' })
    } catch (error) {
      const message = 'Could not edit wallet name'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <ScrollScreen
        usesKeyboard
        fill
        screenTitle={t('Wallet name')}
        headerOptions={{
          type: 'stack',
          headerRight: () => <ContinueButton title={t('Save')} onPress={handleSavePress} iconProps={undefined} />,
          ...headerOptions
        }}
        {...props}
      >
        <ScreenSection verticalGap fill>
          <Input value={name} onChangeText={setName} label={t('New name')} maxLength={24} autoFocus />
        </ScreenSection>
      </ScrollScreen>
      <SpinnerModal isActive={loading} text={`${t('Saving')}...`} />
    </>
  )
}

export default EditWalletNameScreen
