import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Badge from '~/components/Badge'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesHiddenFungibleTokens } from '~/store/addresses/addressesSelectors'

const SettingsAssetsSection = () => {
  const { t } = useTranslation()
  const selectAddressesHiddenFungibleTokens = useMemo(() => makeSelectAddressesHiddenFungibleTokens(), [])
  const numberOfHiddenFungibleTokens = useAppSelector(selectAddressesHiddenFungibleTokens).length
  const theme = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  return (
    <ScreenSection>
      <ScreenSectionTitle>{t('Assets')}</ScreenSectionTitle>

      <Row
        title="Hidden assets"
        subtitle={t("Hide assets you're not interested in")}
        onPress={() => navigation.navigate('HiddenAssetsScreen')}
        isLast
      >
        <Badge>{numberOfHiddenFungibleTokens}</Badge>
        <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
      </Row>
    </ScreenSection>
  )
}

export default SettingsAssetsSection
