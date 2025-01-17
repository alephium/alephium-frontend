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
import { closeModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesHiddenFungibleTokens,
  makeSelectAddressesKnownFungibleTokens
} from '~/store/addresses/addressesSelectors'
import { BORDER_RADIUS_BIG, VERTICAL_GAP } from '~/style/globalStyle'

const AddressesTokensList = () => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, undefined, true))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector(selectAddressesCheckedUnknownTokens)
  const selectAddressesHiddenFungibleTokens = useMemo(makeSelectAddressesHiddenFungibleTokens, [])
  const hiddenFungibleTokens = useAppSelector(selectAddressesHiddenFungibleTokens)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const { t } = useTranslation()

  const hasHiddenTokens = hiddenFungibleTokens.length > 0
  const hasUnknownTokens = unknownTokens.length > 0

  if (addressesBalancesStatus === 'uninitialized')
    return (
      <EmptyPlaceholder>
        <AppText size={32}>⏳</AppText>
        <AppText>{t('Loading your balances...')}</AppText>
      </EmptyPlaceholder>
    )

  if (knownFungibleTokens.length === 0 && !hasUnknownTokens && !hasHiddenTokens)
    return (
      <EmptyPlaceholder>
        <AppText size={32}>👀</AppText>
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
  const selectAddressesHiddenFungibleTokens = useMemo(makeSelectAddressesHiddenFungibleTokens, [])
  const hiddenFungibleTokens = useAppSelector((s) => selectAddressesHiddenFungibleTokens(s, addressHash))
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const hasHiddenTokens = hiddenFungibleTokens.length > 0
  const hasUnknownTokens = unknownTokens.length > 0

  const handleHiddenAssetsPress = () => {
    navigation.navigate('HiddenAssetsScreen')

    parentModalId && dispatch(closeModal({ id: parentModalId }))
  }

  return (
    <AddressesTokensListFooterStyled>
      {hasHiddenTokens && (
        <HiddenAssetBtnContainer>
          <Button
            title={t('nb_of_hidden_assets', { count: hiddenFungibleTokens.length })}
            onPress={handleHiddenAssetsPress}
            iconProps={{ name: 'plus' }}
            compact
          />
        </HiddenAssetBtnContainer>
      )}

      {hasUnknownTokens && (
        <HiddenAssetBtnContainer>
          {addressHash ? (
            <Button
              title={t('unknownTokensKey', { count: unknownTokens.length })}
              onPress={() => openBrowserAsync(`${explorerBaseUrl}/addresses/${addressHash}`)}
              iconProps={{ name: 'plus' }}
              compact
            />
          ) : (
            <AppText color="tetriary">+ {t('unknownTokensKey', { count: unknownTokens.length })}</AppText>
          )}
        </HiddenAssetBtnContainer>
      )}
    </AddressesTokensListFooterStyled>
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

const AddressesTokensListFooterStyled = styled.View`
  margin-bottom: ${VERTICAL_GAP}px;
`
