import { CURRENCIES } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import { BalanceSummaryBox } from '~/components/BalanceSummary'
import { TokenDetailsModalCommonProps } from '~/features/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'

const TokenDetailsModalBalanceSummary = ({ tokenId, addressHash }: TokenDetailsModalCommonProps) => {
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
    </BalanceSummaryBox>
  )
}

export default TokenDetailsModalBalanceSummary
