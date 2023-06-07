/*
Copyright 2018 - 2022 The Alephium Authors
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

import { Asset, fromHumanReadableAmount, getNumberOfDecimals, toHumanReadableAmount } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleProp, TextInput, ViewStyle } from 'react-native'
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { BackButton, ContinueButton } from '~/screens/Send/SendScreenHeader'
import SendScreenIntro from '~/screens/Send/SendScreenIntro'
import { makeSelectAddressesAssets, selectAddressByHash } from '~/store/addressesSlice'
import { isNumericStringValid } from '~/utils/numbers'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AssetsScreen'> {
  style?: StyleProp<ViewStyle>
}

const AssetsScreen = ({ navigation, style }: ScreenProps) => {
  const { fromAddress, assetAmounts, buildTransaction } = useSendContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const selectAddressesAssets = useMemo(makeSelectAddressesAssets, [])
  const assets = useAppSelector((s) => selectAddressesAssets(s, address ? [address.hash] : []))

  const isContinueButtonDisabled = assetAmounts.length < 1

  useEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => (
        <ContinueButton
          onPress={() =>
            buildTransaction({
              onBuildSuccess: () => navigation.navigate('VerifyScreen'),
              onConsolidationSuccess: () => navigation.navigate('TransfersScreen')
            })
          }
          disabled={isContinueButtonDisabled}
        />
      )
    })
  }, [buildTransaction, isContinueButtonDisabled, navigation])

  if (!address) return null

  return (
    <ScrollScreen style={style}>
      <SendScreenIntro title="Assets" subtitle="With Alephium, you can send multiple assets in one transaction." />
      <ScreenSection>
        <AssetsList>
          {assets.map((asset, index) => (
            <AssetRow key={asset.id} asset={asset} isLast={index === assets.length - 1} />
          ))}
        </AssetsList>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default AssetsScreen

interface AssetRowProps {
  asset: Asset
  isLast: boolean
  style?: StyleProp<ViewStyle>
}

const AssetRow = ({ asset, style, isLast }: AssetRowProps) => {
  const theme = useTheme()
  const { assetAmounts, setAssetAmount } = useSendContext()

  const assetAmount = assetAmounts.find(({ id }) => id === asset.id)

  const [isSelected, setIsSelected] = useState(!!assetAmount)
  const [amount, setAmount] = useState(
    assetAmount && assetAmount.amount ? toHumanReadableAmount(assetAmount.amount) : ''
  )
  const [error, setError] = useState('')

  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)

  const handleOnAmountChange = (inputAmount: string) => {
    const cleanedAmount = isNumericStringValid(inputAmount, true) ? inputAmount : ''

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
    setAmount(toHumanReadableAmount(asset.balance - asset.lockedBalance))
  }

  const handleOnPress = () => {
    setAmount('')
    setError('')
    setIsSelected(!isSelected)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: withTiming(isSelected ? 1 : 0)
  }))

  const topRowAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: withTiming(isSelected ? 18 : 0),
    paddingLeft: withTiming(isSelected ? 11 : 0),
    backgroundColor: isSelected ? theme.bg.accent : 'transparent'
  }))

  return (
    <Pressable onPress={handleOnPress}>
      <AssetRowStyled style={[style, animatedStyle]}>
        <TopRow style={topRowAnimatedStyle}>
          <AssetLogoStyled assetId={asset.id} size={38} />
          <AssetDetails showSeparator={!isLast && !isSelected}>
            <AssetName semiBold size={17} numberOfLines={1} ellipsizeMode="middle">
              {asset.name || asset.id}
            </AssetName>
            <Amount
              value={asset.balance - asset.lockedBalance}
              suffix={asset.symbol}
              isUnknownToken={!asset.symbol}
              medium
              color="secondary"
            />
          </AssetDetails>
        </TopRow>
        {isSelected && (
          <BottomRow entering={FadeIn}>
            <AmountInputRow>
              <AppText semiBold size={15}>
                Amount
              </AppText>
              <AmountInputValue>
                <AmountTextInput
                  value={amount}
                  onChangeText={handleOnAmountChange}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  autoFocus={true}
                />
                <AppText semiBold size={23} color="secondary">
                  {asset.symbol}
                </AppText>
              </AmountInputValue>
            </AmountInputRow>
            <Row>
              <AppText color="alert" size={11}>
                {error}
              </AppText>
              <UseMaxButton title="Use max" onPress={handleUseMaxAmountPress} type="transparent" variant="accent" />
            </Row>
          </BottomRow>
        )}
      </AssetRowStyled>
    </Pressable>
  )
}

const AssetsList = styled.View`
  gap: 20px;
`

const AssetRowStyled = styled(Animated.View)`
  border-radius: 9px;
  border-color: ${({ theme }) => theme.border.primary};
  overflow: hidden;
`

const AssetDetails = styled.View<{ showSeparator: boolean }>`
  gap: 10px;
  flex-grow: 1;
  padding-bottom: 20px;

  ${({ showSeparator }) =>
    showSeparator &&
    css`
      border-bottom-width: 1px;
      border-bottom-color: ${({ theme }) => theme.border.secondary};
    `}
`

const AssetName = styled(AppText)`
  max-width: 80%;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-bottom: 20px;
`

const TopRow = styled(Animated.View)`
  flex-direction: row;
  gap: 15px;
  align-items: center;
`

const BottomRow = styled(Animated.View)`
  padding: 14px 17px 11px;
`

const AmountInputRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`

const UseMaxButton = styled(Button)`
  padding: 0;
  height: auto;
`

const AmountInputValue = styled.View`
  flex-direction: row;
  gap: 5px;
`

const AmountTextInput = styled(TextInput)`
  font-weight: 600;
  font-size: 23px;
`
