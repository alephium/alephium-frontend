import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { openBrowserAsync } from 'expo-web-browser'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import TokenListItem from '~/components/TokenListItem'
import {
  selectAddressHiddenAssetIds,
  selectHiddenAssetsIds
} from '~/features/assetsDisplay/hideAssets/hiddenAssetsSelectors'
import { closeModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesCheckedUnknownTokens, makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, VERTICAL_GAP } from '~/style/globalStyle'

const AddressesTokensList = () => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, undefined, true))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector(selectAddressesCheckedUnknownTokens)
  const hiddenAssetIds = useAppSelector(selectHiddenAssetsIds)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const { t } = useTranslation()

  const hasHiddenTokens = hiddenAssetIds.length > 0
  const hasUnknownTokens = unknownTokens.length > 0

  if (addressesBalancesStatus === 'uninitialized')
    return (
      <EmptyPlaceholder>
        <AppText size={28}>⏳</AppText>
        <AppText>{t('Loading your balances...')}</AppText>
      </EmptyPlaceholder>
    )

  if (knownFungibleTokens.length === 0 && !hasUnknownTokens && !hasHiddenTokens)
    return (
      <EmptyPlaceholder>
        <AppText size={28}>👀</AppText>
        <AppText>{t('No assets here, yet.')}</AppText>
      </EmptyPlaceholder>
    )

  return (
    <AddressesTokensListStyled>
      {knownFungibleTokens.map((entry, index) => (
        <TokenListItem
          key={entry.id}
          asset={entry}
          hideSeparator={index === knownFungibleTokens.length - 1 && unknownTokens.length === 0}
        />
      ))}

      <AddressesTokensListFooter />
    </AddressesTokensListStyled>
  )
}

export default AddressesTokensList

interface AddressesTokensListFooterProps {
  addressHash?: string
  parentModalId?: ModalInstance['id']
}

export const AddressesTokensListFooter = ({ addressHash, parentModalId }: AddressesTokensListFooterProps) => {
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))
  const hiddenAssetIds = useAppSelector((s) =>
    addressHash ? selectAddressHiddenAssetIds(s, addressHash) : selectHiddenAssetsIds(s)
  )
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const hasHiddenTokens = hiddenAssetIds.length > 0
  const hasUnknownTokens = unknownTokens.length > 0

  const handleHiddenAssetsPress = () => {
    navigation.navigate('HiddenAssetsScreen')

    parentModalId && dispatch(closeModal({ id: parentModalId }))
  }

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
            onPress={handleHiddenAssetsPress}
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

const HiddenAssetBtnContainer = styled.View`
  flex-grow: 0;
  margin: ${VERTICAL_GAP}px auto 0;
`
