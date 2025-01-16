import {
  convertToPositive,
  formatAmountForDisplay,
  formatFiatAmountForDisplay,
  MAGNITUDE_SYMBOL
} from '@alephium/shared'
import styled from 'styled-components'

import { useAssetMetadata } from '@/api/assets/assetsHooks'

import AssetLogo from './AssetLogo'

interface AmountProps {
  assetId?: string
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fadeDecimals?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  overrideSuffixColor?: boolean
  tabIndex?: number
  suffix?: string
  highlight?: boolean
  fullPrecision?: boolean
  smartRounding?: boolean
  displaySign?: boolean
  className?: string
}

const Amount = ({
  value,
  assetId,
  isFiat,
  className,
  fadeDecimals,
  nbOfDecimalsToShow = 4,
  suffix,
  color,
  overrideSuffixColor,
  tabIndex,
  fullPrecision = false,
  smartRounding = true,
  displaySign = false
}: AmountProps) => {
  const assetMetadata = useAssetMetadata(assetId || '')

  let quantitySymbol = ''
  let amount = ''
  const isNegative = value && value < 0

  const assetType = assetMetadata.type
  const isUnknownToken = assetType === undefined

  let decimals = 0
  let usedSuffix = suffix

  if (assetType === 'fungible' || isFiat) {
    if (assetType === 'fungible') {
      decimals = assetMetadata.decimals
      usedSuffix = assetMetadata.symbol
    }

    if (value !== undefined) {
      amount = getAmount({ value, isFiat, decimals, nbOfDecimalsToShow, fullPrecision, smartRounding })

      if (fadeDecimals && MAGNITUDE_SYMBOL.some((char) => amount.endsWith(char))) {
        quantitySymbol = amount.slice(-1)
        amount = amount.slice(0, -1)
      }
    }
  } else if (assetType === undefined) {
    amount = getAmount({ value, fullPrecision: true })
  }

  const [integralPart, fractionalPart] = amount.split('.')

  const RawAmountComponent = () => (
    <>
      <RawAmount data-tooltip-id="default" data-tooltip-content={convertToPositive(value as bigint).toString()}>
        {value?.toString()}
      </RawAmount>
      <Suffix>?</Suffix>
    </>
  )

  return (
    <span className={className} tabIndex={tabIndex ?? -1}>
      {assetType === 'fungible' || isFiat ? (
        !usedSuffix && !decimals ? (
          <RawAmountComponent />
        ) : (
          <>
            <NumberContainer
              data-tooltip-id="default"
              data-tooltip-content={
                (!fullPrecision &&
                  value &&
                  getAmount({ value, isFiat, decimals, nbOfDecimalsToShow, fullPrecision: true })) ||
                undefined
              }
            >
              {displaySign && <span>{isNegative ? '-' : '+'}</span>}
              {fadeDecimals ? (
                <>
                  <span>{integralPart}</span>
                  {fractionalPart && <Decimals>.{fractionalPart}</Decimals>}
                  {quantitySymbol && <span>{quantitySymbol}</span>}
                </>
              ) : fractionalPart ? (
                `${integralPart}.${fractionalPart}`
              ) : (
                integralPart
              )}
            </NumberContainer>
            <Suffix color={overrideSuffixColor ? color : undefined}> {usedSuffix}</Suffix>
          </>
        )
      ) : assetType === 'non-fungible' && assetId ? (
        <NFT>
          {displaySign && <span>{isNegative ? '-' : '+'}</span>}
          <NFTName data-tooltip-id="default" data-tooltip-content={assetMetadata.file.name}>
            {assetMetadata.file.name}
          </NFTName>
          <NFTInlineLogo assetId={assetId} size={15} showTooltip />
        </NFT>
      ) : isUnknownToken || !decimals ? (
        <RawAmountComponent />
      ) : (
        '-'
      )}
    </span>
  )
}

const getAmount = ({
  value,
  isFiat,
  decimals,
  nbOfDecimalsToShow,
  fullPrecision,
  smartRounding
}: Partial<AmountProps>) =>
  isFiat && typeof value === 'number'
    ? formatFiatAmountForDisplay(value)
    : formatAmountForDisplay({
        amount: convertToPositive(value as bigint),
        amountDecimals: decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision,
        smartRounding
      })

export default styled(Amount)`
  color: ${({ color, highlight, value, theme }) =>
    color
      ? color
      : highlight && value !== undefined
        ? value < 0
          ? theme.global.alert
          : theme.global.valid
        : 'inherit'};
  white-space: nowrap;
  font-weight: 600;
`

const NumberContainer = styled.span``

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const RawAmount = styled.div`
  display: inline-block;
  max-width: 120px;
  text-overflow: ellipsis;
  overflow: hidden;
  vertical-align: bottom;
`

const NFT = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const NFTName = styled.div`
  display: inline-block;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const NFTInlineLogo = styled(AssetLogo)`
  display: inline-block;
  margin-left: 2px;
`
