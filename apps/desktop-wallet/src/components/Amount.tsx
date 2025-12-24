import { convertToPositive, formatAmountForDisplay, isFT, TokenId } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { Optional } from '@alephium/web3'
import { MouseEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'

export interface AmountBaseProps {
  fadeDecimals?: boolean
  color?: string
  overrideSuffixColor?: boolean
  tabIndex?: number
  highlight?: boolean
  showPlusMinus?: boolean
  semiBold?: boolean
  className?: string
  useTinyAmountShorthand?: boolean
}

export interface TokenAmountProps extends AmountBaseProps {
  tokenId: TokenId
  value: bigint
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
}

export interface FiatAmountProps extends AmountBaseProps {
  isFiat: true
  value: number
}

interface CustomAmountProps extends AmountBaseProps {
  value: number
  suffix: string
}

type AmountProps = TokenAmountProps | FiatAmountProps | CustomAmountProps

type AmountPropsWithOptionalAmount =
  | Optional<TokenAmountProps, 'value'>
  | Optional<FiatAmountProps, 'value'>
  | Optional<CustomAmountProps, 'value'>

export interface AmountLoaderProps {
  isLoading?: boolean
  isFetching?: boolean
  error?: boolean
  loaderHeight?: number
}

const Amount = ({
  isLoading,
  isFetching,
  error,
  loaderHeight = 15,
  ...props
}: AmountPropsWithOptionalAmount & AmountLoaderProps) => {
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const [isAmountHidden, setIsAmountHidden] = useState(discreetMode)
  const [highlightDimensions, setHighlightDimensions] = useState<DOMRect | null>(null)
  const amountRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const { t } = useTranslation()
  const theme = useTheme()

  useEffect(() => {
    setIsAmountHidden(discreetMode)
  }, [discreetMode])

  useEffect(() => {
    setHighlightDimensions(null)
  }, [isAmountHidden])

  if (isLoading) return <SkeletonLoader height={`${loaderHeight}px`} width={`${loaderHeight * 5}px`} />

  if (props.value === undefined) return null

  // Since we checked above that value is defined it's safe to cast the type so that the stricter components can work
  const amountProps = props as AmountProps

  const { className, value, highlight, tabIndex, showPlusMinus, semiBold } = amountProps

  const color = props.color
    ? props.color
    : highlight && value !== undefined
      ? value < 0
        ? theme.font.primary
        : theme.global.valid
      : 'inherit'

  const toggleAmountVisibility = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsAmountHidden(!isAmountHidden)
  }

  const handleTextMouseEnter = () => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect()
      // Use handy object to define a rectangle with padding
      const paddedRect = new DOMRect(rect.left - 4, rect.top - 4, rect.width + 8, rect.height + 8)
      setHighlightDimensions(paddedRect)
    }
  }

  const handleTextMouseLeave = () => {
    setHighlightDimensions(null)
  }

  if (isAmountHidden) {
    return (
      <>
        <AmountStyled
          ref={amountRef}
          data-tooltip-id="default"
          data-tooltip-content={t('Click to display the amount')}
          data-tooltip-delay-show={200}
          onClick={toggleAmountVisibility}
          {...{ className, color, value, highlight, semiBold, tabIndex: tabIndex ?? -1 }}
        >
          <AmountContainer ref={textRef} onMouseEnter={handleTextMouseEnter} onMouseLeave={handleTextMouseLeave}>
            •••
          </AmountContainer>
        </AmountStyled>
        {highlightDimensions && <ClickSurfaceHighlight dimensions={highlightDimensions} />}
      </>
    )
  }

  return (
    <>
      <AmountStyled
        ref={amountRef}
        {...{ className, color, value, highlight, semiBold, tabIndex: tabIndex ?? -1 }}
        onClick={discreetMode ? toggleAmountVisibility : undefined}
      >
        {showPlusMinus && <span>{value < 0 ? '-' : '+'}</span>}

        <AmountContainer ref={textRef} onMouseEnter={handleTextMouseEnter} onMouseLeave={handleTextMouseLeave}>
          {isFiat(amountProps) ? (
            <FiatAmount {...amountProps} color={color} />
          ) : isCustom(amountProps) ? (
            <CustomAmount {...amountProps} color={color} />
          ) : (
            <TokenAmount {...amountProps} color={color} />
          )}
          <DataFetchIndicator isLoading={isLoading} isFetching={isFetching} error={error} />
        </AmountContainer>
      </AmountStyled>
      {discreetMode && highlightDimensions && <ClickSurfaceHighlight dimensions={highlightDimensions} />}
    </>
  )
}

export default Amount

const TokenAmount = ({
  tokenId,
  value,
  fullPrecision,
  nbOfDecimalsToShow,
  fadeDecimals,
  overrideSuffixColor,
  color,
  showPlusMinus,
  useTinyAmountShorthand
}: TokenAmountProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token) return null

  const amount = isFT(token)
    ? formatAmountForDisplay({
        amount: convertToPositive(value),
        amountDecimals: token.decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision,
        useSubscriptNotation: true
      })
    : value.toString()

  return (
    <>
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} useTinyAmountShorthand={useTinyAmountShorthand} />

      {isFT(token) && <Suffix color={overrideSuffixColor || showPlusMinus ? color : undefined}> {token.symbol}</Suffix>}
    </>
  )
}

const FiatAmount = ({ value }: FiatAmountProps) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const region = useAppSelector((s) => s.settings.region)

  if (value === null) return null

  return new Intl.NumberFormat(region, { style: 'currency', currency: fiatCurrency }).format(value)
}

const CustomAmount = ({
  value,
  fadeDecimals,
  overrideSuffixColor,
  color,
  suffix,
  showPlusMinus
}: CustomAmountProps) => {
  const amount = (value < 1 ? value * -1 : value).toString()

  return (
    <>
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} />

      <Suffix color={overrideSuffixColor || showPlusMinus ? color : undefined}> {suffix}</Suffix>
    </>
  )
}

interface AmountPartitions extends Pick<AmountBaseProps, 'fadeDecimals' | 'useTinyAmountShorthand'> {
  amount: string
}

const AmountPartitions = ({ amount, fadeDecimals, useTinyAmountShorthand }: AmountPartitions) => {
  let quantitySymbol = ''

  if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
    quantitySymbol = amount.slice(-1)
    amount = amount.slice(0, -1)
  }

  let [integralPart, fractionalPart] = amount.split('.')

  if (useTinyAmountShorthand && amount.startsWith('0.0000')) {
    integralPart = '< 0'
    fractionalPart = '0001'
  }

  // Check for subscripts (₀-₉)
  const subscriptMatch = fractionalPart?.match(/([₀-₉]+)/)

  if (subscriptMatch) {
    const subscript = subscriptMatch[1]
    const [preSubscript, postSubscript] = fractionalPart.split(subscript)

    return (
      <>
        <span>{integralPart}</span>
        <Decimals>.{preSubscript}</Decimals>
        <Subscript>{subscript}</Subscript>
        <span>{postSubscript}</span>
        {quantitySymbol && <span>{quantitySymbol}</span>}
      </>
    )
  }

  return fadeDecimals ? (
    <>
      <span>{integralPart}</span>
      {fractionalPart && <Decimals>.{fractionalPart}</Decimals>}
      {quantitySymbol && <span>{quantitySymbol}</span>}
    </>
  ) : fractionalPart ? (
    `${integralPart}.${fractionalPart}`
  ) : (
    integralPart
  )
}

const Subscript = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const DataFetchIndicator = ({ isLoading, isFetching, error }: AmountLoaderProps) => {
  const { t } = useTranslation()

  if (!isLoading && !isFetching && !error) return null

  return (
    <DataFetchIndicatorContainer>
      <DataFetchIndicatorStyled
        data-tooltip-id="default"
        data-tooltip-content={t(error ? 'Could not get latest data' : 'Updating...')}
      >
        <DataFetchIndicatorDot status={error ? 'error' : 'isFetching'} />
      </DataFetchIndicatorStyled>
    </DataFetchIndicatorContainer>
  )
}

const isFiat = (asset: AmountProps): asset is FiatAmountProps => (asset as FiatAmountProps).isFiat === true

const isCustom = (asset: AmountProps): asset is CustomAmountProps => (asset as CustomAmountProps).suffix !== undefined

const ClickSurfaceHighlight = styled.div<{
  dimensions: DOMRect | null
}>`
  position: fixed;
  border-radius: 4px;
  top: ${({ dimensions }) => dimensions?.top ?? 0}px;
  left: ${({ dimensions }) => dimensions?.left ?? 0}px;
  width: ${({ dimensions }) => dimensions?.width ?? 0}px;
  height: ${({ dimensions }) => dimensions?.height ?? 0}px;
  background-color: ${({ theme }) => theme.bg.primary};
  pointer-events: none;
`

const AmountStyled = styled.div<Pick<AmountProps, 'color' | 'highlight' | 'value' | 'semiBold'>>`
  color: ${({ color }) => color};
  display: inline-flex;
  position: relative;
  font-weight: var(--fontWeight-${({ semiBold }) => (semiBold ? 'bold' : 'medium')});
  white-space: pre;
  font-feature-settings: 'tnum' on;
`

const AmountContainer = styled.span``

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color ?? theme.font.secondary};
  font-weight: var(--fontWeight-semiBold);
`

const DataFetchIndicatorStyled = styled.span`
  margin-left: var(--spacing-1);
`

const DataFetchIndicatorContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: var(--spacing-1);
`

const DataFetchIndicatorDot = styled.div<{ status: 'isFetching' | 'error' }>`
  width: 0.3em;
  height: 0.3em;
  background-color: ${({ theme, status }) => (status === 'isFetching' ? theme.font.secondary : theme.global.alert)};
  border-radius: 50%;
  position: relative;
  top: -0.15em;

  ${({ status }) =>
    status === 'isFetching' &&
    css`
      animation: pulse 1s infinite;
    `}

  @keyframes pulse {
    0% {
      opacity: 0.2;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.2;
    }
  }
`
