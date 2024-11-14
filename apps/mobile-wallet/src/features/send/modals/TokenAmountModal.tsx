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

import {
  AddressHash,
  fromHumanReadableAmount,
  FungibleToken,
  getNumberOfDecimals,
  toHumanReadableAmount
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Button from '~/components/buttons/Button'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { isNumericStringValid } from '~/utils/numbers'

interface TokenAmountModalProps {
  tokenId: FungibleToken['id']
  onAmountValidate: (amount: bigint) => void
  addressHash?: AddressHash
  initialAmount?: bigint
}

const MAX_FONT_SIZE = 42
const MIN_FONT_SIZE = 22
const MAX_FONT_LENGTH = 10

const TokenAmountModal = withModal<TokenAmountModalProps>(
  ({ id, tokenId, onAmountValidate, addressHash, initialAmount }) => {
    const dispatch = useAppDispatch()
    const theme = useTheme()
    const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
    const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
    const token = knownFungibleTokens.find((t) => t.id === tokenId)

    const { t } = useTranslation()
    const [amount, setAmount] = useState(initialAmount ? toHumanReadableAmount(initialAmount, token?.decimals) : '')

    const [error, setError] = useState('')

    if (!token) return

    const maxAmount = useMemo(() => token.balance - token.lockedBalance, [token.balance, token.lockedBalance])
    const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)

    const handleAmountChange = (amount: string) => {
      let cleanedAmount = amount.replace(',', '.')
      cleanedAmount = isNumericStringValid(cleanedAmount, true) ? cleanedAmount : ''

      const isAboveMaxAmount = parseFloat(amount) > parseFloat(toHumanReadableAmount(maxAmount, token.decimals))
      const amountValueAsFloat = parseFloat(cleanedAmount)
      const tooManyDecimals = getNumberOfDecimals(cleanedAmount) > (token.decimals ?? 0)

      const newError = isAboveMaxAmount
        ? t('Amount exceeds available balance')
        : token.id === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph) && amountValueAsFloat !== 0
          ? t('Amount must be greater than {{ minAmount }}', { minAmount: minAmountInAlph })
          : tooManyDecimals
            ? t('This asset cannot have more than {{ numberOfDecimals }} decimals', {
                numberOfDecimals: token.decimals
              })
            : ''

      setError(newError)
      setAmount(cleanedAmount)
    }

    const handleUseMaxAmountPress = () => {
      setAmount(toHumanReadableAmount(maxAmount, token.decimals))
    }

    const handleAmountValidate = () => {
      onAmountValidate(amount ? fromHumanReadableAmount(amount) : BigInt(0))
      dispatch(closeModal({ id }))
    }

    return (
      <BottomModal
        modalId={id}
        title={
          <ModalHeader>
            <AssetLogo size={18} assetId={token?.id} />
            <AppText semiBold size={16}>
              {token?.name}
            </AppText>
          </ModalHeader>
        }
      >
        <ContentWrapper>
          <InputWrapper>
            <TokenAmoutInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0"
              keyboardType="numeric"
              autoComplete="off"
              autoFocus
              allowFontScaling
              fontSize={getFontSize(amount)}
              style={{
                color: error ? theme.global.alert : theme.font.primary
              }}
            />
            <SuffixText fontSize={getFontSize(amount)}>{token?.symbol}</SuffixText>
          </InputWrapper>
          <Button title={t('Use max')} onPress={handleUseMaxAmountPress} type="transparent" variant="accent" />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ContentWrapper>
        <Button title={t('Continue')} variant="highlight" onPress={handleAmountValidate} disabled={!!error} />
      </BottomModal>
    )
  }
)

const getFontSize = (text: string) => {
  if (text.length <= MAX_FONT_LENGTH) {
    return MAX_FONT_SIZE
  } else {
    const extraLength = text.length - MAX_FONT_LENGTH
    const newFontSize = MAX_FONT_SIZE - extraLength * 2
    return newFontSize < MIN_FONT_SIZE ? MIN_FONT_SIZE : newFontSize
  }
}

export default TokenAmountModal

const ModalHeader = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const ContentWrapper = styled.View`
  height: 160px;
  align-items: center;
  justify-content: center;
`

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const TokenAmoutInput = styled.TextInput<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 600;
  text-align: right;
  flex-shrink: 1;
`

const SuffixText = styled(AppText)<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  margin-left: 6px;
`

const ErrorMessage = styled(AppText)`
  position: absolute;
  bottom: 20px;
  color: ${({ theme }) => theme.global.alert};
`
