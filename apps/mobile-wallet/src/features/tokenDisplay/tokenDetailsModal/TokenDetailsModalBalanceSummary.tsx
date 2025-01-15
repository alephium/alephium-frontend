import { CURRENCIES } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import { BalanceSummaryBox } from '~/components/BalanceSummary'
import { openModal } from '~/features/modals/modalActions'
import { TokenDetailsModalCommonProps } from '~/features/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressesWithToken } from '~/store/addresses/addressesSelectors'
import { makeSelectAddressesKnownFungibleTokens, selectAllAddresses } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface TokenDetailsModalBalanceSummaryProps extends TokenDetailsModalCommonProps {
  onPress: () => void
}

const TokenDetailsModalBalanceSummary = ({ tokenId, addressHash, onPress }: TokenDetailsModalBalanceSummaryProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const { t } = useTranslation()

  const token = knownFungibleTokens.find((token) => token.id === tokenId)

  if (!token) return null

  return (
    <BalanceSummaryBox>
      <AppText>{addressHash ? t('Address balance') : t('Wallet balance')}</AppText>
      <Amount size={44} semiBold value={token.balance} suffix={token.symbol} decimals={token.decimals} />
      <Amount isFiat value={token.worth} suffix={CURRENCIES[currency].symbol} size={24} semiBold />
      <AddressesWithTokenBadge tokenId={tokenId} onPress={onPress} />
    </BalanceSummaryBox>
  )
}

export default TokenDetailsModalBalanceSummary

const AddressesWithTokenBadge = ({ tokenId, onPress }: TokenDetailsModalBalanceSummaryProps) => {
  const addresses = useAppSelector((s) => selectAddressesWithToken(s, tokenId))
  const totalNumberOfAddresses = useAppSelector(selectAllAddresses).length
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (addresses.length === 0 || totalNumberOfAddresses === 1) return null

  const handlePress = () => {
    onPress()
    dispatch(openModal({ name: 'AddressesWithTokenModal', props: { tokenId } }))
  }

  return (
    <AddressesWithTokenBadgeStyled onPress={handlePress}>
      <Badge solid>
        {t(addresses.length === 1 ? 'token_in_addresses_one' : 'token_in_addresses_other', { count: addresses.length })}
      </Badge>
    </AddressesWithTokenBadgeStyled>
  )
}

const AddressesWithTokenBadgeStyled = styled(Pressable)`
  margin-top: ${VERTICAL_GAP}px;
`
