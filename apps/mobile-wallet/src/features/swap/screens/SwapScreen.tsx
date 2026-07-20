import { MAX_PRICE_IMPACT } from '@alephium/powfi-sdk'
import { AnalyticsEvent } from '@alephium/shared'
import { formatAmountForDisplay } from '@alephium/shared/numbers'
import { isFT, TokenId } from '@alephium/shared/types'
import { useFetchAddressBalances, useFetchAddressSingleTokenBalances, useFetchToken } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { StackScreenProps } from '@react-navigation/stack'
import { useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressSelectorCard from '~/components/AddressSelectorCard'
import Button from '~/components/buttons/Button'
import ScrollScreen from '~/components/layout/ScrollScreen'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { openModal } from '~/features/modals/modalActions'
import SwapFlipButton from '~/features/swap/components/SwapFlipButton'
import SwapInfoBoard from '~/features/swap/components/SwapInfoBoard'
import SwapProgressStepper from '~/features/swap/components/SwapProgressStepper'
import SwapTokenRow from '~/features/swap/components/SwapTokenRow'
import useExecuteSwap from '~/features/swap/hooks/useExecuteSwap'
import useFetchSwappableTokens from '~/features/swap/hooks/useFetchSwappableTokens'
import useSwapConfirmation from '~/features/swap/hooks/useSwapConfirmation'
import useSwapQuote from '~/features/swap/hooks/useSwapQuote'
import { SWAP_HIGH_PRICE_IMPACT_PERCENT } from '~/features/swap/swapConstants'
import { classifySwapError } from '~/features/swap/swapErrors'
import { swapExecutionInitialState, swapExecutionReducer } from '~/features/swap/swapExecutionMachine'
import { selectSwapFromAddressHash } from '~/features/swap/swapSelectors'
import { swapFromAddressChanged, swapFromAddressReset } from '~/features/swap/swapSlice'
import { SwapQuoteError } from '~/features/swap/swapTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import useFungibleTokenAmountInput from '~/hooks/useFungibleTokenAmountInput'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

type SwapScreenProps = StackScreenProps<RootStackParamList, 'SwapScreen'>

const SwapScreen = ({ route }: SwapScreenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const fromAddressHash = useAppSelector(selectSwapFromAddressHash)
  const slippage = useAppSelector((s) => s.swap.slippage)
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const { executeSwap } = useExecuteSwap()

  const [fromTokenId, setFromTokenId] = useState<TokenId | undefined>(route.params?.initialFromTokenId ?? ALPH.id)
  const [toTokenId, setToTokenId] = useState<TokenId | undefined>(undefined)
  const [execution, dispatchExecution] = useReducer(swapExecutionReducer, swapExecutionInitialState)

  const submittedTxHash = execution.status === 'submitted' ? execution.txHash : undefined
  const confirmation = useSwapConfirmation(submittedTxHash)
  const isSwapSettled = confirmation !== 'pending'

  const isSwapInProgress = execution.status === 'signing' || (execution.status === 'submitted' && !isSwapSettled)
  // Frozen from signing through confirmation so nothing reflows under the stepper.
  const isPanelLocked = execution.status === 'signing' || execution.status === 'submitted'

  const { data: fromToken } = useFetchToken(fromTokenId ?? '')
  const { data: toToken } = useFetchToken(toTokenId ?? '')
  const { data: fromTokenBalances } = useFetchAddressSingleTokenBalances({
    addressHash: fromAddressHash ?? '',
    tokenId: fromTokenId ?? ''
  })
  const { data: addressBalances } = useFetchAddressBalances(fromAddressHash ?? '')
  const { tokenIds: pairableTokenIds, isLoading: isLoadingPairs } = useFetchSwappableTokens(fromTokenId)

  const fromDecimals = fromToken && isFT(fromToken) ? fromToken.decimals : 0
  const toDecimals = toToken && isFT(toToken) ? toToken.decimals : 0
  const fromSymbol = fromToken && isFT(fromToken) ? fromToken.symbol : ''
  const toSymbol = toToken && isFT(toToken) ? toToken.symbol : ''
  const maxBalance = fromTokenBalances ? BigInt(fromTokenBalances.availableBalance) : 0n

  const {
    amount,
    error: amountError,
    amountParsed,
    handleAmountChange,
    handleMax,
    formattedMaxBalance,
    setAmount
  } = useFungibleTokenAmountInput({ maxBalance, decimals: fromDecimals })

  const slippageBps = Math.round(slippage * 10000)
  const {
    quote,
    error: quoteError,
    isComputing
  } = useSwapQuote({
    inputMint: fromTokenId,
    outputMint: toTokenId,
    amount: amountParsed,
    direction: 'sell',
    slippageBps,
    paused: isPanelLocked
  })

  const toAmountDisplay = quote
    ? formatAmountForDisplay({ amount: BigInt(quote.outputAmount), amountDecimals: toDecimals })
    : ''

  const balancesMap = useMemo(
    () => new Map((addressBalances ?? []).map((balance) => [balance.id, BigInt(balance.availableBalance)])),
    [addressBalances]
  )

  const resetSwap = () => {
    dispatchExecution({ type: 'RESET' })
    setAmount('')
  }

  const handleSelectFromToken = (id: TokenId) => {
    dispatchExecution({ type: 'RESET' })
    // The picked from-address may not hold the new input token, so fall back to the default address.
    dispatch(swapFromAddressReset())
    if (id === toTokenId) setToTokenId(undefined)
    setFromTokenId(id)
    setAmount('')
  }

  const handleSelectToToken = (id: TokenId) => {
    dispatchExecution({ type: 'RESET' })
    if (id === fromTokenId) setFromTokenId(undefined)
    setToTokenId(id)
  }

  const handleAmountChangeWithReset = (value: string) => {
    dispatchExecution({ type: 'RESET' })
    handleAmountChange(value)
  }

  const openFromTokenSelect = () =>
    dispatch(
      openModal({
        name: 'SwapTokenSelectModal',
        props: {
          addressHash: fromAddressHash ?? '',
          onSelectToken: handleSelectFromToken,
          excludeTokenId: toTokenId
        }
      })
    )

  const openToTokenSelect = () =>
    dispatch(
      openModal({
        name: 'SwapTokenSelectModal',
        props: {
          addressHash: fromAddressHash ?? '',
          onSelectToken: handleSelectToToken,
          pairedWithTokenId: fromTokenId,
          excludeTokenId: fromTokenId
        }
      })
    )

  const openSlippageModal = () => dispatch(openModal({ name: 'SwapSlippageModal' }))

  const openFromAddressSelect = () => {
    if (!fromTokenId || !fromAddressHash) return

    dispatch(
      openModal({
        name: 'SwapFromAddressModal',
        props: {
          tokenId: fromTokenId,
          selectedAddressHash: fromAddressHash,
          onSelectAddress: (addressHash) => dispatch(swapFromAddressChanged(addressHash))
        }
      })
    )
  }

  const handleFlip = () => {
    dispatchExecution({ type: 'RESET' })
    // After a flip the input token changes, so the from-address may no longer hold it: reset to default.
    dispatch(swapFromAddressReset())
    setFromTokenId(toTokenId)
    setToTokenId(fromTokenId)
  }

  const performSwap = async () => {
    if (!quote) return

    dispatchExecution({ type: 'SUBMIT' })

    try {
      const result = await executeSwap(quote, balancesMap)
      sendAnalytics({ event: AnalyticsEvent.EXECUTED_SWAP, props: { provider: 'Powfi' } })
      dispatchExecution({ type: 'SUBMITTED', txHash: result.txId })
    } catch (error) {
      const { kind, raw } = classifySwapError(error)
      const message =
        kind === 'insufficient_balance'
          ? t('This address does not have enough balance for this transaction')
          : t('The swap could not be completed')

      dispatchExecution({ type: 'FAILED', message, details: raw || undefined })
    }
  }

  const handleSwapPress = () => {
    if (!quote) return

    const runSwap = () =>
      triggerBiometricsAuthGuard({
        settingsToCheck: 'transactions',
        successCallback: () => triggerFundPasswordAuthGuard({ successCallback: performSwap })
      })

    if (quote.priceImpactPct > SWAP_HIGH_PRICE_IMPACT_PERCENT) {
      dispatch(
        openModal({
          name: 'SwapHighPriceImpactModal',
          props: { priceImpactPct: quote.priceImpactPct, onConfirm: runSwap }
        })
      )
    } else {
      runSwap()
    }
  }

  const getQuoteErrorMessage = (error: SwapQuoteError): string => {
    switch (error.code) {
      case 'NO_POOL':
        return t('No swap pool available for this token pair')
      case 'INSUFFICIENT_LIQUIDITY':
        return t('Insufficient liquidity for this swap')
      case 'TOKEN_NOT_FOUND':
        return t('Token not found')
      case 'INVALID_SLIPPAGE':
        return t('Invalid slippage value')
      case 'INVALID_AMOUNT':
        return t('Invalid swap amount')
      case 'PRICE_UNAVAILABLE':
        return t('Price information unavailable')
      default:
        return t('Unable to compute swap')
    }
  }

  const hasNoPairs =
    !!fromTokenId && !isLoadingPairs && pairableTokenIds.filter((id) => id !== fromTokenId).length === 0
  const isCpmmImpactTooHigh = quote?.poolType === 'standard' && quote.priceImpactPct > MAX_PRICE_IMPACT

  const getSwapButton = (): { title: string; disabled: boolean; loading: boolean } => {
    if (isSwapInProgress) return { title: t('Swapping...'), disabled: true, loading: true }
    if (!fromTokenId) return { title: t('Select a token'), disabled: true, loading: false }
    if (hasNoPairs)
      return { title: t('No pairs available for {{ symbol }}', { symbol: fromSymbol }), disabled: true, loading: false }
    if (!toTokenId) return { title: t('Select a token'), disabled: true, loading: false }
    if (amountError) return { title: amountError, disabled: true, loading: false }
    if (!amountParsed || amountParsed === 0n) return { title: t('Enter an amount'), disabled: true, loading: false }
    if (isComputing) return { title: t('Fetching best price...'), disabled: true, loading: true }
    if (quoteError) return { title: getQuoteErrorMessage(quoteError), disabled: true, loading: false }
    if (isCpmmImpactTooHigh) return { title: t('Price impact too high'), disabled: true, loading: false }
    if (!quote) return { title: t('Fetching best price...'), disabled: true, loading: false }

    return {
      title: t('Swap {{ tokenFrom }} for {{ tokenTo }}', { tokenFrom: fromSymbol, tokenTo: toSymbol }),
      disabled: false,
      loading: false
    }
  }

  if (!fromAddressHash) return null

  const swapButton = getSwapButton()

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop
      hasKeyboard
      style={{ paddingHorizontal: DEFAULT_MARGIN }}
      headerOptions={{
        type: 'stack',
        headerTitle: t('Swap'),
        headerRight: () => (
          <Button
            onPress={openSlippageModal}
            title={`${slippage * 100}%`}
            iconProps={{ name: 'options-outline' }}
            compact
          />
        )
      }}
      bottomButtonsRender={() =>
        isSwapSettled ? (
          <Button title={t('Done')} onPress={resetSwap} variant="highlight" />
        ) : (
          <Button
            title={swapButton.title}
            onPress={handleSwapPress}
            disabled={swapButton.disabled}
            loading={swapButton.loading}
            variant="highlight"
          />
        )
      }
    >
      <AddressSelectorCard
        label={t('Address to use')}
        addressHash={fromAddressHash}
        tokenId={fromTokenId}
        onPress={openFromAddressSelect}
        disabled={isPanelLocked}
      />

      <SwapPanel>
        <SwapTokenRow
          label={t('You pay')}
          editable
          disabled={isPanelLocked}
          tokenId={fromTokenId}
          amount={amount}
          onAmountChange={handleAmountChangeWithReset}
          onMaxPress={handleMax}
          onSelectTokenPress={openFromTokenSelect}
          formattedBalance={formattedMaxBalance}
          error={amountError}
        />
        <FlipButtonWrapper>
          <SwapFlipButton onPress={handleFlip} disabled={isPanelLocked} />
        </FlipButtonWrapper>
        <SwapTokenRow
          label={t('You receive')}
          editable={false}
          disabled={isPanelLocked}
          tokenId={toTokenId}
          amount={toAmountDisplay}
          onSelectTokenPress={openToTokenSelect}
        />
      </SwapPanel>

      {execution.status !== 'idle' && <SwapProgressStepper execution={execution} confirmation={confirmation} />}

      {execution.status === 'idle' && quote && <SwapInfoBoard quote={quote} />}
    </ScrollScreen>
  )
}

export default SwapScreen

const SwapPanel = styled.View`
  gap: 6px;
`

const FlipButtonWrapper = styled.View`
  align-items: center;
  margin-top: -20px;
  margin-bottom: -20px;
  z-index: 1;
`
