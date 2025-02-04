import { AddressHash, AssetAmount, calculateAmountWorth, selectAllPrices } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Amount from '~/components/Amount'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addresses/addressesSelectors'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface TotalWorthRowProps {
  assetAmounts: AssetAmount[]
  fromAddress: AddressHash
}

// This component will be improved by reusing the worth in desktop wallet after migrating to Tanstack
const TotalWorthRow = ({ assetAmounts, fromAddress }: TotalWorthRowProps) => {
  const tokenPrices = useAppSelector(selectAllPrices)
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, fromAddress))
  const { t } = useTranslation()

  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
  const assets = [{ id: ALPH.id, amount: attoAlphAmount }, ...tokens]

  const totalWorth = assets.reduce((totalWorth, token) => {
    const tokenInfo = knownFungibleTokens.find(({ id }) => id === token.id)
    const tokenPrice = tokenPrices.find(({ symbol }) => symbol === tokenInfo?.symbol)?.price

    return totalWorth + calculateAmountWorth(BigInt(token.amount), tokenPrice ?? 0, tokenInfo?.decimals ?? 0)
  }, 0)

  if (!totalWorth) return null

  return (
    <Row title={t('Total worth')} titleColor="secondary">
      <Amount value={totalWorth} isFiat bold />
    </Row>
  )
}

export default TotalWorthRow
