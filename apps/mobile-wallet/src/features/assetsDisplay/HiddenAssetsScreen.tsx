import { StackScreenProps } from '@react-navigation/stack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import TokenListItem from '~/components/TokenListItem'
import { selectHiddenAssetsIds } from '~/features/assetsDisplay/hiddenAssetsSelectors'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface HiddenAssetsScreenProps extends StackScreenProps<RootStackParamList, 'HiddenAssetsScreen'>, ScreenProps {}

const HiddenAssetsScreen = ({ navigation, ...props }: HiddenAssetsScreenProps) => {
  const { t } = useTranslation()
  const hiddenAssetsIds = useAppSelector((s) => selectHiddenAssetsIds(s))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s))

  const handleAddAssetPress = () => {
    sendAnalytics({ event: 'Saved list of hidden assets' })

    navigation.navigate('SettingsScreen')
  }

  return (
    <ScrollScreen
      fill
      headerOptions={{ headerTitle: t('Hidden assets'), type: 'stack' }}
      screenTitle={t('Hidden assets')}
      screenIntro={t('Here is the list of assets you are hiding')}
      contentPaddingTop
      {...props}
    >
      <ScreenSection fill>
        {hiddenAssetsIds.length === 0 ? (
          <EmptyPlaceholder style={{ flexGrow: 0 }}>
            <AppText size={28}>✨</AppText>
            <AppText>{t('No assets are hidden')}</AppText>
          </EmptyPlaceholder>
        ) : (
          <FungibleTokensList>
            {hiddenAssetsIds.map((id) => {
              const token = knownFungibleTokens.find((t) => t.id === id)
              return token && <TokenListItem asset={token} />
            })}
          </FungibleTokensList>
        )}
      </ScreenSection>
      <BottomButtons>
        <Button title={t('Add an asset to hide')} type="primary" variant="contrast" onPress={handleAddAssetPress} />
      </BottomButtons>
    </ScrollScreen>
  )
}

export default HiddenAssetsScreen

const FungibleTokensList = styled.View`
  gap: ${VERTICAL_GAP / 2}px;
`
