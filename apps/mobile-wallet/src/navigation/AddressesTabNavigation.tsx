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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import TabBarPager from '~/components/layout/TabBarPager'
import RootStackParamList from '~/navigation/rootStackRoutes'
import AddressesScreen from '~/screens/Addresses/AddressesScreen'
import ContactsScreen from '~/screens/Addresses/ContactsScreen'

const AddressesTabNavigation = () => {
  const { t } = useTranslation()

  const [focusedTabIndex, setFocusedTabIndex] = useState(0)

  return (
    <TabBarPager
      initialPage={0}
      headerTitle={t('Addresses')}
      tabLabels={[t('Your addresses'), t('Contacts')]}
      pages={[AddressesScreen, ContactsScreen]}
      customHeaderContent={<CustomHeaderContent focusedTabIndex={focusedTabIndex} />}
      onTabChange={setFocusedTabIndex}
    />
  )
}

export default AddressesTabNavigation

const CustomHeaderContent = ({ focusedTabIndex }: { focusedTabIndex: number }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const handleButtonPress = () => {
    navigation.navigate(focusedTabIndex === 0 ? 'NewAddressScreen' : 'NewContactScreen')
  }

  return (
    <CustomHeaderContentStyled>
      <View style={{ width: 40 }} />
      <AppText semiBold size={17}>
        {t('Address book')}
      </AppText>
      <Button iconProps={{ name: 'plus' }} squared onPress={handleButtonPress} compact />
    </CustomHeaderContentStyled>
  )
}

const CustomHeaderContentStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
