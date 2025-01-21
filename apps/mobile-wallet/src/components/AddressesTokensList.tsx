import { AddressHash } from '@alephium/shared'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { openBrowserAsync } from 'expo-web-browser'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { selectHiddenAssetsIds } from '~/features/assetsDisplay/hideAssets/hiddenAssetsSelectors'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesCheckedUnknownTokens, makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, VERTICAL_GAP } from '~/style/globalStyle'

import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  addressHash?: AddressHash
  isLoading?: boolean
  parentModalId?: ModalInstance['id']
}

const AddressesTokensList = ({ addressHash, isLoading, parentModalId }: AddressesTokensListProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash, true))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))
  const hiddenAssetIds = useAppSelector(selectHiddenAssetsIds)
  const isLoadingTokenBalances = useAppSelector((s) => s.loaders.loadingTokens)
  const isLoadingUnverified = useAppSelector((s) => s.fungibleTokens.loadingUnverified)
  const isLoadingVerified = useAppSelector((s) => s.fungibleTokens.loadingVerified)
  const isLoadingTokenTypes = useAppSelector((s) => s.fungibleTokens.loadingTokenTypes)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const theme = useTheme()
  const { t } = useTranslation()

  const hasHiddenTokens = hiddenAssetIds.length > 0
  const hasUnknownTokens = unknownTokens.length > 0
  const showLoader = knownFungibleTokens.length > 4 ? isLoading : false

  const showTokensSkeleton =
    showLoader ||
    ((isLoadingTokenBalances || isLoadingUnverified || isLoadingVerified || isLoadingTokenTypes) &&
      addressesBalancesStatus === 'initialized')

  if (addressesBalancesStatus === 'uninitialized')
    return (
      <EmptyPlaceholder>
        <AppText size={28}>⏳</AppText>
        <AppText>{t('Loading your balances...')}</AppText>
      </EmptyPlaceholder>
    )

  if (!showTokensSkeleton && knownFungibleTokens.length === 0 && !hasUnknownTokens && !hasHiddenTokens)
    return (
      <EmptyPlaceholder>
        <AppText size={28}>👀</AppText>
        <AppText>{t('No assets here, yet.')}</AppText>
      </EmptyPlaceholder>
    )

  if (showLoader) {
    const loaderSectionEstimatedHeight =
      60 * knownFungibleTokens.length +
      (hasUnknownTokens ? 33 + VERTICAL_GAP : 0) +
      (hasHiddenTokens ? 33 + VERTICAL_GAP : 0)

    return (
      <AddressesTokensListStyled>
        <LoadingSectionContainer style={{ height: loaderSectionEstimatedHeight }}>
          <ActivityIndicator size={72} color={theme.font.primary} />
        </LoadingSectionContainer>
      </AddressesTokensListStyled>
    )
  }

  return (
    <AddressesTokensListStyled>
      {knownFungibleTokens.map((entry, index) => (
        <TokenListItem
          key={entry.id}
          asset={entry}
          hideSeparator={index === knownFungibleTokens.length - 1 && unknownTokens.length === 0}
          addressHash={addressHash}
          parentModalId={parentModalId}
        />
      ))}

      <AddressesTokensListFooter addressHash={addressHash} />
    </AddressesTokensListStyled>
  )
}

export default AddressesTokensList

export const AddressesTokensListFooter = ({ addressHash }: AddressesTokensListProps) => {
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))
  const hiddenAssetIds = useAppSelector(selectHiddenAssetsIds)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()

  const hasHiddenTokens = hiddenAssetIds.length > 0
  const hasUnknownTokens = unknownTokens.length > 0

  return (
    <>
      {hasUnknownTokens && (
        <HiddenAssetBtnContainer>
          <Button
            title={t('unknownTokensKey', { count: unknownTokens.length })}
            onPress={addressHash ? () => openBrowserAsync(`${explorerBaseUrl}/addresses/${addressHash}`) : undefined}
            iconProps={{ name: 'plus' }}
            compact
          />
        </HiddenAssetBtnContainer>
      )}

      {hasHiddenTokens && (
        <HiddenAssetBtnContainer>
          <Button
            title={t('nb_of_hidden_assets', { count: hiddenAssetIds.length })}
            onPress={() => navigation.navigate('HiddenAssetsScreen')}
            iconProps={{ name: 'plus' }}
            compact
          />
        </HiddenAssetBtnContainer>
      )}
    </>
  )
}

const AddressesTokensListStyled = styled.View`
  padding: 10px 0;
  border-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
  position: relative;
`

const LoadingSectionContainer = styled.View`
  width: 100%;
  align-items: center;
  padding: 60px 0 40px;
`

const HiddenAssetBtnContainer = styled.View`
  flex-grow: 0;
  margin: ${VERTICAL_GAP}px auto 0;
`
