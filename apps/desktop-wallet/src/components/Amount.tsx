import { convertToPositive, formatAmountForDisplay } from '@alephium/shared'
import { Optional } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import SkeletonLoader from '@/components/SkeletonLoader'
import { discreetModeToggled } from '@/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { isFT, TokenId } from '@/types/tokens'

interface AmountBaseProps {
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
  const dispatch = useAppDispatch()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const { t } = useTranslation()
  const theme = useTheme()

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

  amountProps.color = color

  const toggleDiscreetMode = () => discreetMode && dispatch(discreetModeToggled())

  return (
    <AmountStyled
      {...{ className, color, value, highlight, semiBold, tabIndex: tabIndex ?? -1, discreetMode }}
      data-tooltip-id="default"
      data-tooltip-content={discreetMode ? t('Click to deactivate discreet mode') : ''}
      data-tooltip-delay-show={500}
      onClick={toggleDiscreetMode}
    >
      <DataFetchIndicator isLoading={isLoading} isFetching={isFetching} error={error} />

      {showPlusMinus && <span>{value < 0 ? '-' : '+'}</span>}

      {isFiat(amountProps) ? (
        <FiatAmount {...amountProps} />
      ) : isCustom(amountProps) ? (
        <CustomAmount {...amountProps} />
      ) : (
        <TokenAmount {...amountProps} />
      )}
    </AmountStyled>
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
        fullPrecision
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

const DataFetchIndicator = ({ isLoading, isFetching, error }: AmountLoaderProps) => {
  const { t } = useTranslation()

  if (!isLoading && !isFetching && !error) return null

  return (
    <DataFetchIndicatorStyled
      data-tooltip-id="default"
      data-tooltip-content={t(error ? 'Could not get latest data' : 'Updating...')}
    >
      <DataFetchIndicatorDot status={error ? 'error' : 'isFetching'} />
    </DataFetchIndicatorStyled>
  )
}

const isFiat = (asset: AmountProps): asset is FiatAmountProps => (asset as FiatAmountProps).isFiat === true

const isCustom = (asset: AmountProps): asset is CustomAmountProps => (asset as CustomAmountProps).suffix !== undefined

const AmountStyled = styled.div<
  Pick<AmountProps, 'color' | 'highlight' | 'value' | 'semiBold'> & { discreetMode: boolean }
>`
  color: ${({ color }) => color};
  display: inline-flex;
  position: relative;
  font-weight: var(--fontWeight-${({ semiBold }) => (semiBold ? 'bold' : 'medium')});
  white-space: pre;
  font-feature-settings: 'tnum' on;
  ${({ discreetMode }) =>
    discreetMode &&
    css`
      filter: blur(10px);
      max-width: 100px;
      overflow: hidden;
      cursor: pointer;
    `}
`

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color ?? theme.font.secondary};
  font-weight: var(--fontWeight-semiBold);
`

const DataFetchIndicatorStyled = styled.div`
  position: absolute;
  top: -5px;
  left: -15px;
  padding: 5px;
`

const DataFetchIndicatorDot = styled.div<{ status: 'isFetching' | 'error' }>`
  width: 6px;
  height: 6px;
  background-color: ${({ theme, status }) => (status === 'isFetching' ? theme.font.secondary : theme.global.alert)};
  border-radius: 50%;

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
