import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import TabBarPager from '~/components/layout/TabBarPager'
import RootStackParamList from '~/navigation/rootStackRoutes'
import AddressesScreen from '~/screens/Addresses/AddressesScreen'
import ContactsScreen from '~/screens/Addresses/ContactsScreen'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

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
      <AppText semiBold size={17} color="secondary">
        {t('Address book')}
      </AppText>
      <Button iconProps={{ name: 'plus' }} variant="contrast" squared onPress={handleButtonPress} compact />
    </CustomHeaderContentStyled>
  )
}

const CustomHeaderContentStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: ${DEFAULT_MARGIN}px;
`
