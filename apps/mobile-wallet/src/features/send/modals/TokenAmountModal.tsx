import {
  AddressHash,
  calculateTokenAmountWorth,
  fromHumanReadableAmount,
  FungibleToken,
  getNumberOfDecimals,
  selectAllPrices,
  selectFungibleTokenById,
  toHumanReadableAmount
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Button from '~/components/buttons/Button'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesUnknownTokens
} from '~/store/addresses/addressesSelectors'
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
    const selectAddressesKnownFungibleTokens = useMemo(() => makeSelectAddressesKnownFungibleTokens(), [])
    const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
    const selectAddressesUnknownTokens = useMemo(() => makeSelectAddressesUnknownTokens(), [])
    const unknownTokens = useAppSelector((s) => selectAddressesUnknownTokens(s, addressHash))
    const token = knownFungibleTokens.find((t) => t.id === tokenId) ?? unknownTokens.find((t) => t.id === tokenId)

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
      onAmountValidate(amount ? fromHumanReadableAmount(amount, token.decimals) : BigInt(0))
      dispatch(closeModal({ id }))
    }

    const handleClearAmountPress = () => setAmount('')

    const fontSize = getFontSize(`${amount}+${token.symbol}`)
    const amountIsSet = amount && amount !== '0'

    return (
      <BottomModal
        modalId={id}
        titleAlign="left"
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
              fontSize={fontSize}
              style={{
                color: error ? theme.global.alert : theme.font.primary
              }}
            />
            <SuffixText fontSize={fontSize}>{token?.symbol}</SuffixText>
          </InputWrapper>

          <EnteredAmountWorth tokenId={tokenId} amount={amount} />

          <Buttons>
            <Button title={t('Use max')} onPress={handleUseMaxAmountPress} type="transparent" variant="accent" />
            {amountIsSet && <Button title={t('clear_amount')} onPress={handleClearAmountPress} type="transparent" />}
          </Buttons>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ContentWrapper>
        <Button title={t('Continue')} variant="highlight" onPress={handleAmountValidate} disabled={!!error} />
      </BottomModal>
    )
  }
)

export default TokenAmountModal

interface EnteredAmountWorthProps {
  tokenId: FungibleToken['id']
  amount: string
}

const EnteredAmountWorth = ({ tokenId, amount }: EnteredAmountWorthProps) => {
  const tokenPrices = useAppSelector(selectAllPrices)
  const token = useAppSelector((s) => selectFungibleTokenById(s, tokenId))

  const tokenPrice = tokenPrices.find((p) => p.symbol === token?.symbol)?.price
  const tokenAmount = amount ? fromHumanReadableAmount(amount, token?.decimals) : BigInt(0)
  const totalWorth = token ? calculateTokenAmountWorth(tokenAmount, tokenPrice ?? 0, token?.decimals ?? 0) : undefined

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
  bottom: 6px;
  color: ${({ theme }) => theme.global.alert};
`

const Buttons = styled.View`
  flex-direction: row;
`

const AmountWorth = styled(Amount)`
  padding-top: 5px;
`
