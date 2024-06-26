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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { Portal } from 'react-native-portalize'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import BottomModal, { BottomModalProps } from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { fundPasswordReminded } from '~/features/fund-password/fundPasswordActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

type FundPasswordModalProps = Pick<BottomModalProps, 'isOpen' | 'onClose'>

const FundPasswordReminderModal = ({ isOpen, onClose }: FundPasswordModalProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(fundPasswordReminded())
  }, [dispatch])

  const handleClose = () => {
    Alert.alert(t('Are you sure?'), t('To enhance your security it is recommended to use a fund password.'), [
      {
        text: t('Later'),
        onPress: onClose
      },
      {
        text: t('Set fund password'),
        onPress: handleSetPasswordPress
      }
    ])
  }

  const handleSetPasswordPress = () => {
    onClose()

    navigation.navigate('FundPasswordScreen', { origin: 'settings', newPassword: true })
  }

  return (
    <Portal>
      <BottomModal
        isOpen={isOpen}
        onClose={handleClose}
        Content={(props) => (
          <ModalContent {...props} verticalGap>
            <ScreenSection>
              <BottomModalScreenTitle>{t('Pin replaced by fund password')}</BottomModalScreenTitle>
            </ScreenSection>
            <ScreenSection>
              <AppText color="secondary" size={18}>
                <Trans t={t} i18nKey="fundPasswordModalDescription" components={{ 1: <AppText size={18} bold /> }}>
                  {
                    'The <1>fund password</1> is an additional authentication layer for critical operations involving the safety of your funds such as <1>revealing your seed phrase</1> or <1>sending funds</1>.\nYou can set it up in the app settings.'
                  }
                </Trans>
              </AppText>
            </ScreenSection>
            <ScreenSection>
              <ButtonsRow>
                <Button title={t('Later')} onPress={handleClose} flex />
                <Button variant="highlight" title={t('Set password')} onPress={handleSetPasswordPress} flex />
              </ButtonsRow>
            </ScreenSection>
          </ModalContent>
        )}
      />
    </Portal>
  )
}

export default FundPasswordReminderModal
