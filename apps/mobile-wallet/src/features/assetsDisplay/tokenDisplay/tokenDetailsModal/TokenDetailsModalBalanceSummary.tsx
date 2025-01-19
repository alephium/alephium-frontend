import { CURRENCIES } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import { BalanceSummaryBox } from '~/components/BalanceSummary'
import { TokenDetailsModalCommonProps } from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressesWithToken } from '~/store/addresses/addressesSelectors'
import { makeSelectAddressesKnownFungibleTokens, selectAllAddresses } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface TokenDetailsModalBalanceSummaryProps extends TokenDetailsModalCommonProps {
  fontColor?: string
  onPress?: () => void
}

const TokenDetailsModalBalanceSummary = ({
  tokenId,
  addressHash,
  onPress,
  fontColor
}: TokenDetailsModalBalanceSummaryProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const { t } = useTranslation()

  const token = knownFungibleTokens.find((token) => token.id === tokenId)

  if (!token) return null

  return (
    <BalanceSummaryBox>
      <AppText color={fontColor}>{addressHash ? t('Address balance') : t('Wallet balance')}</AppText>
      <Amount
        size={34}
        semiBold
        value={token.balance}
        suffix={token.symbol}
        decimals={token.decimals}
        color={fontColor}
      />
      <AmountAndAddresses>
        {token.worth && (
          <Amount isFiat value={token.worth} suffix={CURRENCIES[currency].symbol} size={20} color={fontColor} />
        )}
        <AddressesWithTokenBadge tokenId={tokenId} onPress={onPress} fontColor={fontColor} />
      </AmountAndAddresses>
    </BalanceSummaryBox>
  )
}

export default TokenDetailsModalBalanceSummary

const AddressesWithTokenBadge = ({ tokenId, onPress, fontColor }: TokenDetailsModalBalanceSummaryProps) => {
  const addresses = useAppSelector((s) => selectAddressesWithToken(s, tokenId))
  const totalNumberOfAddresses = useAppSelector(selectAllAddresses).length
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (addresses.length === 0 || totalNumberOfAddresses === 1) return null

  const handlePress = () => {
    onPress?.()
    dispatch(openModal({ name: 'AddressesWithTokenModal', props: { tokenId } }))
  }

  return (
    <Pressable onPress={handlePress}>
      <Badge color={fontColor}>
        {t(addresses.length === 1 ? 'token_in_addresses_one' : 'token_in_addresses_other', { count: addresses.length })}
      </Badge>
    </Pressable>
  )
}

const AmountAndAddresses = styled.View`
  margin-top: ${VERTICAL_GAP / 2}px;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`
