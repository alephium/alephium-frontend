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

import { useAllAddressesAssets } from '@/api/apiHooks'
import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'
import { getTransactionAssetAmounts } from '@/utils/transactions'

interface CheckAmountsBoxProps {
  assetAmounts: AssetAmount[]
  className?: string
}

const CheckAmountsBox = ({ assetAmounts, className }: CheckAmountsBoxProps) => {
  const { t } = useTranslation()
  const userSpecifiedAlphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount
  const { attoAlphAmount, tokens, extraAlphForDust } = getTransactionAssetAmounts(assetAmounts)
  const allAddresses = useAppSelector(selectAllAddresses)
  const { data: allAssets } = useAllAddressesAssets()

  const fungibleTokens = allAssets?.fungible
  const nfts = allAssets?.nft

  const alphAsset = { id: ALPH.id, amount: attoAlphAmount }
  const assets = userSpecifiedAlphAmount ? [alphAsset, ...tokens] : [...tokens, alphAsset]

  return (
    <Box className={className}>
      {assets.map((asset, index) => {
        const fungibleToken = fungibleTokens[asset.id]
        const nftInfo = nfts[asset.id]

        return (
          <Fragment key={asset.id}>
            {index > 0 && <HorizontalDivider />}
            <AssetAmountRow>
              <AssetLogo
                assetImageUrl={fungibleToken?.logoURI ?? nftInfo?.image}
                size={30}
                assetName={fungibleToken?.name}
              />
              <AssetAmountStyled
                value={BigInt(asset.amount)}
                suffix={fungibleToken?.symbol}
                decimals={fungibleToken?.decimals}
                isUnknownToken={!fungibleToken?.symbol}
                fullPrecision
              />
              {asset.id === ALPH.id && !!extraAlphForDust && (
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
          </Fragment>
        )
      })}
    </Box>
  )
}

export default CheckAmountsBox

const AssetAmountRow = styled.div`
  display: flex;
  padding: 23px 0;
  justify-content: center;
  align-items: center;
  gap: 15px;
`

const AssetAmountStyled = styled(Amount)`
  font-weight: var(--fontWeight-semiBold);
  font-size: 26px;
`
