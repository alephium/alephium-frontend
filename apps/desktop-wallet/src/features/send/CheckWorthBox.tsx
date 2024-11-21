/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AssetAmount, calculateAmountWorth } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { isNumber } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'
import Amount from '@/components/Amount'
import Box from '@/components/Box'
import InfoRow from '@/features/send/InfoRow'

interface CheckWorthBoxProps {
  assetAmounts: AssetAmount[]
}

const CheckWorthBox = ({ assetAmounts }: CheckWorthBoxProps) => {
  const { t } = useTranslation()

  const {
    data: { listedFts },
    isLoading: isLoadingTokensByType
  } = useFetchTokensSeparatedByType(assetAmounts)

  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const totalWorth = listedFts.reduce((totalWorth, token) => {
    const tokenPrice = tokenPrices?.find(({ symbol }) => symbol === token.symbol)?.price
    const tokenAmount = assetAmounts.find((asset) => asset.id === token.id)?.amount
    const tokenWorth =
      isNumber(tokenPrice) && tokenAmount !== undefined
        ? calculateAmountWorth(tokenAmount, tokenPrice, token.decimals)
        : 0

    return totalWorth + tokenWorth
  }, 0)

  return (
    <Box>
      <InfoRow label={t('Total worth')}>
        <AmountStyled
          tokenId={ALPH.id}
          value={totalWorth}
          isFiat
          isLoading={isLoadingTokensByType || isLoadingTokenPrices}
        />
      </InfoRow>
    </Box>
  )
}

export default CheckWorthBox

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
`
