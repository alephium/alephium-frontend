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

import { AddressHash, FungibleToken, toHumanReadableAmount } from '@alephium/shared'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomModal from '~/features/modals/BottomModal'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'

interface TokenAmountModalProps {
  tokenId: FungibleToken['id']
  addressHash?: AddressHash
}

const MAX_FONT_SIZE = 42
const MIN_FONT_SIZE = 22
const MAX_FONT_LENGTH = 10

const TokenAmountModal = withModal<TokenAmountModalProps>(({ id, tokenId, addressHash }) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const token = knownFungibleTokens.find((t) => t.id === tokenId)

  const { t } = useTranslation()
  const [amount, setAmount] = useState('')

  const handleUseMaxAmountPress = () => {
    if (!token) return

    const maxAmount = token.balance - token.lockedBalance

    setAmount(toHumanReadableAmount(maxAmount, token.decimals))
  }

  return (
    <BottomModal modalId={id} title={token?.name}>
      <InputWrapper>
        <TokenAmoutInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          autoComplete="off"
          autoFocus
          allowFontScaling
          fontSize={getFontSize(amount)}
        />
        <SuffixText fontSize={getFontSize(amount)}>{token?.symbol}</SuffixText>
      </InputWrapper>
      <Button title={t('Use max')} onPress={handleUseMaxAmountPress} type="transparent" variant="accent" />
    </BottomModal>
  )
})

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

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const TokenAmoutInput = styled.TextInput<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 600;
  text-align: right;
  color: ${({ theme }) => theme.font.primary};
  flex-shrink: 1;
`

const SuffixText = styled(AppText)<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  margin-left: 6px;
`
