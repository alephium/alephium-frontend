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

import { AssetAmount, toHumanReadableAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Info } from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchToken, { isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { getTransactionAssetAmounts } from '@/features/send/sendUtils'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface CheckAmountsBoxProps {
  assetAmounts: AssetAmount[]
  className?: string
}

const CheckAmountsBox = ({ assetAmounts, className }: CheckAmountsBoxProps) => {
  const userSpecifiedAlphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount
  const { attoAlphAmount, tokens, extraAlphForDust } = getTransactionAssetAmounts(assetAmounts)

  const alphAsset = { id: ALPH.id, amount: attoAlphAmount }
  const assets = userSpecifiedAlphAmount ? [alphAsset, ...tokens] : [...tokens, alphAsset]

  return (
    <Box className={className}>
      {assets.map((asset, index) => (
        <Fragment key={asset.id}>
          {index > 0 && <HorizontalDivider />}
          <AssetAmountRowComponent tokenId={asset.id} amount={asset.amount} extraAlphForDust={extraAlphForDust} />
        </Fragment>
      ))}
    </Box>
  )
}

export default CheckAmountsBox

interface AssetAmountRowComponentProps {
  tokenId: string
  amount: string
  extraAlphForDust: bigint
}

const AssetAmountRowComponent = ({ tokenId, amount, extraAlphForDust }: AssetAmountRowComponentProps) => {
  const { t } = useTranslation()
  const { data: token } = useFetchToken(tokenId)

  return (
    <AssetAmountRow>
      <AssetLogo tokenId={tokenId} size={30} />

      <TokenText>
        {isNFT(token) ? token.name : <Amount tokenId={tokenId} value={BigInt(amount)} fullPrecision />}
      </TokenText>
      {tokenId === ALPH.id && !!extraAlphForDust && (
        <ActionLink
          onClick={() => openInWebBrowser(links.utxoDust)}
          tooltip={t('{{ amount }} ALPH are added for UTXO spam prevention. Click here to know more.', {
            amount: toHumanReadableAmount(extraAlphForDust)
          })}
        >
          <Info size={20} />
        </ActionLink>
      )}
    </AssetAmountRow>
  )
}

const AssetAmountRow = styled.div`
  display: flex;
  padding: 23px 0;
  justify-content: center;
  align-items: center;
  gap: 15px;
`

const TokenText = styled.span`
  font-weight: var(--fontWeight-semiBold);
  font-size: 26px;
`
