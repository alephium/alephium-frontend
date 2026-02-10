import {
  AddressHash,
  calculateTokenAmountWorth,
  fromHumanReadableAmount,
  FungibleToken,
  getNumberOfDecimals,
  isFT,
  isNFT,
  toHumanReadableAmount
} from '@alephium/shared'
import { useFetchAddressSingleTokenBalances, useFetchToken, useFetchTokenPrice } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Button from '~/components/buttons/Button'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { isNumericStringValid } from '~/utils/numbers'

interface TokenAmountModalProps {
  tokenId: FungibleToken['id']
  onAmountValidate: (amount: bigint, tokenName: string) => void
  addressHash: AddressHash
  initialAmount?: string
}

const MAX_FONT_SIZE = 42
const MIN_FONT_SIZE = 22
const MAX_FONT_LENGTH = 10

const TokenAmountModal = memo<TokenAmountModalProps>(({ tokenId, onAmountValidate, addressHash, initialAmount }) => {
  const theme = useTheme()
  const { dismissModal } = useModalContext()

  const { data: token } = useFetchToken(tokenId)
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })

  const { t } = useTranslation()

  const [amount, setAmount] = useState(initialAmount)
  const [error, setError] = useState('')

  if (!token || isNFT(token) || !tokenBalances) return

  const maxAmount = BigInt(tokenBalances.availableBalance)
  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)
  const tokenDecimals = isFT(token) ? token.decimals : undefined
  const tokenName = isFT(token) ? token.name : token.id
  const tokenSymbol = isFT(token) ? token.symbol : ''

  const handleAmountChange = (amount: string) => {
    let cleanedAmount = amount.replace(',', '.')
    cleanedAmount = isNumericStringValid(cleanedAmount, true) ? cleanedAmount : ''

    const isAboveMaxAmount = parseFloat(amount) > parseFloat(toHumanReadableAmount(maxAmount, tokenDecimals))
    const amountValueAsFloat = parseFloat(cleanedAmount)
    const tooManyDecimals = getNumberOfDecimals(cleanedAmount) > (tokenDecimals ?? 0)

    const newError = isAboveMaxAmount
      ? t('Amount exceeds available balance')
      : token.id === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph) && amountValueAsFloat !== 0
        ? t('Amount must be greater than {{ minAmount }}', { minAmount: minAmountInAlph })
        : tooManyDecimals
          ? t('This asset cannot have more than {{ numberOfDecimals }} decimals', {
              numberOfDecimals: tokenDecimals
            })
          : ''

    setError(newError)
    setAmount(cleanedAmount)
  }

  const handleUseMaxAmountPress = () => {
    setAmount(toHumanReadableAmount(maxAmount, tokenDecimals))
  }

  const handleAmountValidate = () => {
    onAmountValidate(amount ? fromHumanReadableAmount(amount, tokenDecimals) : BigInt(0), tokenName)
    dismissModal()
  }

  const handleClearAmountPress = () => setAmount('')

  const fontSize = getFontSize(`${amount}+${tokenSymbol}`)
  const amountIsSet = amount && amount !== '0'

  return (
    <BottomModal2
      titleAlign="left"
      notScrollable
      title={
        <ModalHeader>
          <AssetLogo size={18} assetId={token.id} />
          <AppText semiBold size={16}>
            {tokenName}
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
            fontSize={fontSize}
            style={{
              color: error ? theme.global.alert : theme.font.primary
            }}
          />
          <SuffixText fontSize={fontSize}>{tokenSymbol}</SuffixText>
        </InputWrapper>

        {amount && <EnteredAmountWorth tokenId={tokenId} amount={amount} />}

        <Buttons>
          <Button title={t('Use max')} onPress={handleUseMaxAmountPress} type="transparent" variant="accent" />
          {amountIsSet && <Button title={t('clear_amount')} onPress={handleClearAmountPress} type="transparent" />}
        </Buttons>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ContentWrapper>
      <Button title={t('Continue')} variant="highlight" onPress={handleAmountValidate} disabled={!!error} />
    </BottomModal2>
  )
})

export default TokenAmountModal

interface EnteredAmountWorthProps {
  tokenId: FungibleToken['id']
  amount: string
}

const EnteredAmountWorth = ({ tokenId, amount }: EnteredAmountWorthProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { data: tokenPrice } = useFetchTokenPrice(tokenId)

  if (!token || !isFT(token)) return null

  const tokenAmount = amount ? fromHumanReadableAmount(amount, token.decimals) : BigInt(0)
  const totalWorth = calculateTokenAmountWorth(tokenAmount, tokenPrice ?? 0, token.decimals ?? 0)

  if (!totalWorth) return null

  return <AmountWorth value={totalWorth} isFiat color="secondary" />
}

const getFontSize = (text: string) => {
  if (text.length <= MAX_FONT_LENGTH) {
    return MAX_FONT_SIZE
  } else {
    const extraLength = text.length - MAX_FONT_LENGTH
    const newFontSize = MAX_FONT_SIZE - extraLength * 2
    return newFontSize < MIN_FONT_SIZE ? MIN_FONT_SIZE : newFontSize
  }
}

const ModalHeader = styled.View`
  flex-direction: row;
  align-items: center;
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

const TokenAmoutInput = styled(BottomSheetTextInput)<{ fontSize: number }>`
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
  bottom: 6px;
  color: ${({ theme }) => theme.global.alert};
`

const Buttons = styled.View`
  flex-direction: row;
`

const AmountWorth = styled(Amount)`
  padding-top: 5px;
`
