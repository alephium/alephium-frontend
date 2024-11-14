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

import { Asset, NFT } from '@alephium/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import { useTheme } from 'styled-components'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import ListItem from '~/components/ListItem'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useSendContext } from '~/contexts/SendContext'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { isNft } from '~/utils/assets'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface AssetRowProps {
  asset: Asset | NFT
  isLast: boolean
  style?: StyleProp<ViewStyle>
}

const AssetRow = ({ asset, style, isLast }: AssetRowProps) => {
  const dispatch = useAppDispatch()
  const { fromAddress, setAssetAmount: setAssetAmountInContext, assetAmounts } = useSendContext()
  const theme = useTheme()
  const { t } = useTranslation()

  const assetIsNft = isNft(asset)

  const [amount, setAmount] = useState<bigint>(assetAmounts.find((a) => a.id === asset.id)?.amount || BigInt(0))

  const handleRowPress = () => {
    vibrate(ImpactStyle.Medium)

    if (!assetIsNft) {
      dispatch(
        openModal({
          name: 'TokenAmountModal',
          props: { tokenId: asset.id, addressHash: fromAddress, onAmountValidate: onAmountSet, initialAmount: amount }
        })
      )
    } else {
      setAssetAmountInContext(asset.id, BigInt(1))
    }
  }

  const onAmountSet = (amount: bigint) => {
    setAmount(amount)
    setAssetAmountInContext(asset.id, amount)
  }

  return (
    <ListItem
      style={[style]}
      isLast={isLast}
      isSelected={!!amount}
      title={asset.name || asset.id}
      onPress={handleRowPress}
      height={64}
      rightSideContent={
        amount ? (
          assetIsNft ? (
            <Badge rounded solid color={theme.global.accent}>
              <AppText color="white" semiBold>
                {t('NFT')}
              </AppText>
            </Badge>
          ) : (
            <Badge rounded solid color={theme.global.accent}>
              <Amount
                value={amount}
                semiBold
                suffix={asset.symbol}
                decimals={asset.decimals}
                isUnknownToken={!asset.symbol}
                color="white"
              />
            </Badge>
          )
        ) : null
      }
      subtitle={
        assetIsNft ? (
          asset.description
        ) : !amount ? (
          <Amount
            value={asset.balance - asset.lockedBalance}
            suffix={asset.symbol}
            decimals={asset.decimals}
            isUnknownToken={!asset.symbol}
            medium
            color="tertiary"
          />
        ) : undefined
      }
      icon={assetIsNft ? <NFTThumbnail nftId={asset.id} size={38} /> : <AssetLogo assetId={asset.id} size={38} />}
    />
  )
}

export default AssetRow
