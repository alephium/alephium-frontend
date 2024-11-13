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

import { Asset, fromHumanReadableAmount, getNumberOfDecimals, NFT, toHumanReadableAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleProp, TextInput, ViewStyle } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import Amount from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useSendContext } from '~/contexts/SendContext'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { isNft } from '~/utils/assets'
import { ImpactStyle, vibrate } from '~/utils/haptics'
import { isNumericStringValid } from '~/utils/numbers'

interface AssetRowProps {
  asset: Asset | NFT
  isLast: boolean
  style?: StyleProp<ViewStyle>
}

const AssetRow = ({ asset, style, isLast }: AssetRowProps) => {
  const dispatch = useAppDispatch()
  const inputRef = useRef<TextInput>(null)
  const { assetAmounts, setAssetAmount } = useSendContext()
  const { t } = useTranslation()
  const { fromAddress } = useSendContext()

  const assetAmount = assetAmounts.find(({ id }) => id === asset.id)
  const assetIsNft = isNft(asset)

  const [amount, setAmount] = useState(
    assetAmount && assetAmount.amount
      ? toHumanReadableAmount(assetAmount.amount, !assetIsNft ? asset.decimals : undefined)
      : ''
  )
  const [error, setError] = useState('')

  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)

  const handleOnAmountChange = (inputAmount: string) => {
    if (assetIsNft) return

    let cleanedAmount = inputAmount.replace(',', '.')
    cleanedAmount = isNumericStringValid(cleanedAmount, true) ? cleanedAmount : ''

    setAmount(cleanedAmount)

    const amountValueAsFloat = parseFloat(cleanedAmount)
    const tooManyDecimals = getNumberOfDecimals(cleanedAmount) > (asset?.decimals ?? 0)
    const availableAmount = toHumanReadableAmount(asset.balance - asset.lockedBalance, asset.decimals)

    const newError =
      amountValueAsFloat > parseFloat(availableAmount)
        ? t('Amount exceeds available balance')
        : asset.id === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph) && amountValueAsFloat !== 0
          ? t('Amount must be greater than {{ minAmount }}', { minAmount: minAmountInAlph })
          : tooManyDecimals
            ? t('This asset cannot have more than {{ numberOfDecimals }} decimals', {
                numberOfDecimals: asset.decimals
              })
            : ''

    setError(newError)

    if (newError) return

    const amount = !cleanedAmount ? undefined : fromHumanReadableAmount(cleanedAmount, asset.decimals)
    setAssetAmount(asset.id, amount)
  }

  const handlePress = () => {
    vibrate(ImpactStyle.Medium)

    if (!assetIsNft) {
      dispatch(
        openModal({
          name: 'TokenAmountModal',
          props: { tokenId: asset.id, addressHash: fromAddress, onAmountValidate: setAmount }
        })
      )
    }
  }

  const handleBottomRowPress = () => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <ListItem
      style={[style]}
      isLast={isLast}
      title={asset.name || asset.id}
      onPress={handlePress}
      height={64}
      subtitle={
        assetIsNft ? (
          asset.description
        ) : (
          <Amount
            value={asset.balance - asset.lockedBalance}
            suffix={asset.symbol}
            decimals={asset.decimals}
            isUnknownToken={!asset.symbol}
            medium
            color="secondary"
          />
        )
      }
      icon={assetIsNft ? <NFTThumbnail nftId={asset.id} size={38} /> : <AssetLogo assetId={asset.id} size={38} />}
    >
      <Pressable onPress={handleBottomRowPress}>
        <Animated.View entering={FadeIn}></Animated.View>
      </Pressable>
    </ListItem>
  )
}

export default AssetRow
