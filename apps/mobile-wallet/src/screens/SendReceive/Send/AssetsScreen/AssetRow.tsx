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
import { Pressable, StyleProp, TextInput, ViewStyle } from 'react-native'
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Button from '~/components/buttons/Button'
import Checkmark from '~/components/Checkmark'
import ListItem from '~/components/ListItem'
import { useSendContext } from '~/contexts/SendContext'
import { isNft } from '~/utils/assets'
import { ImpactStyle, vibrate } from '~/utils/haptics'
import { isNumericStringValid } from '~/utils/numbers'

interface AssetRowProps {
  asset: Asset | NFT
  isLast: boolean
  style?: StyleProp<ViewStyle>
}

const AssetRow = ({ asset, style, isLast }: AssetRowProps) => {
  const theme = useTheme()
  const inputRef = useRef<TextInput>(null)
  const { assetAmounts, setAssetAmount } = useSendContext()

  const assetAmount = assetAmounts.find(({ id }) => id === asset.id)
  const assetIsNft = isNft(asset)

  const [isSelected, setIsSelected] = useState(!!assetAmount)
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
        ? 'Amount exceeds available balance'
        : asset.id === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph) && amountValueAsFloat !== 0
          ? `Amount must be greater than ${minAmountInAlph}`
          : tooManyDecimals
            ? `This asset cannot have more than ${asset.decimals} decimals`
            : ''

    setError(newError)

    if (newError) return

    const amount = !cleanedAmount ? undefined : fromHumanReadableAmount(cleanedAmount, asset.decimals)
    setAssetAmount(asset.id, amount)
  }

  const handleUseMaxAmountPress = () => {
    if (assetIsNft) return

    const maxAmount = asset.balance - asset.lockedBalance

    setAmount(toHumanReadableAmount(maxAmount, asset.decimals))
    setAssetAmount(asset.id, maxAmount)
  }

  const handleOnRowPress = () => {
    vibrate(ImpactStyle.Medium)

    const isNowSelected = !isSelected
    setIsSelected(isNowSelected)

    if (isNowSelected) {
      if (assetIsNft) {
        setAmount('1')
        setAssetAmount(asset.id, BigInt(1))
      } else {
        setTimeout(() => inputRef.current?.focus(), 500)
      }
    } else {
      setAmount('')
      setAssetAmount(asset.id, undefined)
      setError('')
    }
  }

  const handleBottomRowPress = () => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: withSpring(isSelected ? 2 : 0, fastSpringConfiguration),
    borderColor: withSpring(isSelected ? theme.global.accent : theme.border.secondary, fastSpringConfiguration),
    marginBottom: withSpring(isSelected ? 15 : 0, fastSpringConfiguration)
  }))

  const topRowAnimatedStyle = useAnimatedStyle(() => ({
    paddingLeft: withSpring(isSelected ? 11 : 0, fastSpringConfiguration),
    backgroundColor: isSelected ? theme.bg.highlight : 'transparent'
  }))

  const bottomRowAnimatedStyle = useAnimatedStyle(() => ({
    height: assetIsNft ? 0 : withSpring(isSelected ? 90 : 0, fastSpringConfiguration),
    opacity: assetIsNft ? 0 : withSpring(isSelected ? 1 : 0, fastSpringConfiguration),
    borderTopWidth: assetIsNft ? 0 : withSpring(isSelected ? 1 : 0, fastSpringConfiguration)
  }))

  return (
    <ListItem
      style={[style, animatedStyle]}
      innerStyle={topRowAnimatedStyle}
      isLast={isLast}
      hideSeparator={isSelected}
      title={asset.name || asset.id}
      onPress={handleOnRowPress}
      height={64}
      rightSideContent={<CheckmarkContainer>{isSelected && <Checkmark />}</CheckmarkContainer>}
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
      icon={<AssetLogo assetId={asset.id} size={38} />}
    >
      <Pressable onPress={handleBottomRowPress}>
        <BottomRow entering={FadeIn} style={bottomRowAnimatedStyle}>
          <AmountInputRow>
            <AppText semiBold size={15}>
              Amount
            </AppText>
            <AmountInputValue>
              <AmountTextInput
                value={amount}
                onChangeText={handleOnAmountChange}
                keyboardType="number-pad"
                inputMode="decimal"
                multiline={true}
                numberOfLines={2}
                textAlignVertical="center"
                ref={inputRef}
              />
            </AmountInputValue>
            {!assetIsNft && (
              <AppText semiBold size={23} color="secondary">
                {asset.symbol}
              </AppText>
            )}
          </AmountInputRow>
          <InputBottomPart>
            <ErrorText color="alert" size={11}>
              {error}
            </ErrorText>
            <UseMaxButton title="Use max" onPress={handleUseMaxAmountPress} type="transparent" variant="accent" />
          </InputBottomPart>
        </BottomRow>
      </Pressable>
    </ListItem>
  )
}

export default AssetRow

const BottomRow = styled(Animated.View)`
  padding: 0 15px;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.primary};
  border-top-width: 0px;
  border-top-color: ${({ theme }) => theme.border.primary};
`

const AmountInputRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`

const UseMaxButton = styled(Button)`
  padding: 0;
  height: 23px;
`

const InputBottomPart = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  height: 35%;
  overflow: hidden;
`

const AmountInputValue = styled.View`
  flex: 1;
  justify-content: flex-end;
  overflow: hidden;
`

const AmountTextInput = styled(TextInput)`
  color: ${({ theme }) => theme.font.primary};
  font-weight: 600;
  text-align: right;
  font-size: 23px;
  margin-top: -5px;
`

const CheckmarkContainer = styled.View`
  width: 30px;
  align-items: center;
  justify-content: center;
`

const ErrorText = styled(AppText)`
  max-width: 150px;
`
