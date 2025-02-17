import { AssetAmount, calculateAmountWorth, toHumanReadableAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { isNumber } from 'lodash'
import { Info } from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { openModal } from '@/features/modals/modalActions'
import { getTransactionAssetAmounts } from '@/features/send/sendUtils'
import { useAppDispatch } from '@/hooks/redux'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface CheckAmountsBoxProps {
  assetAmounts: AssetAmount[]
  className?: string
}

const CheckAmountsBox = ({ assetAmounts, className }: CheckAmountsBoxProps) => {
  const userSpecifiedAlphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount
  const { attoAlphAmount, tokens, extraAlphForDust } = getTransactionAssetAmounts(assetAmounts)

  const alphAsset = { id: ALPH.id, amount: attoAlphAmount }
  const assets = userSpecifiedAlphAmount ? [alphAsset, ...tokens] : [...tokens, alphAsset]

  return (
    <Box className={className}>
      {assets.map((asset, index) => (
        <Fragment key={asset.id}>
          {index > 0 && <HorizontalDivider />}
          <AssetAmountRow tokenId={asset.id} amount={asset.amount} extraAlphForDust={extraAlphForDust} />
        </Fragment>
      ))}
    </Box>
  )
}

export default CheckAmountsBox

interface AssetAmountRowProps {
  tokenId: string
  amount: string
  extraAlphForDust: bigint
}

const AssetAmountRow = ({ tokenId, amount, extraAlphForDust }: AssetAmountRowProps) => {
  const { t } = useTranslation()
  const { data: token } = useFetchToken(tokenId)
  const dispatch = useAppDispatch()

  if (!token) return null

  const handleRowClick = () => {
    if (isNFT(token)) dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId: tokenId } }))
  }

  return (
    <AssetAmountRowStyled onClick={isNFT(token) ? handleRowClick : undefined}>
      <LogoAndName>
        <AssetLogo tokenId={tokenId} size={30} />

        {(isFT(token) || isNFT(token)) && <TokenName>{token.name}</TokenName>}

        {tokenId === ALPH.id && !!extraAlphForDust && (
          <ActionLink
            onClick={() => openInWebBrowser(links.utxoDust)}
            tooltip={t('{{ amount }} ALPH are added for UTXO spam prevention. Click here to know more.', {
              amount: toHumanReadableAmount(extraAlphForDust)
            })}
          >
            <Info size={16} />
          </ActionLink>
        )}
      </LogoAndName>

      {!isNFT(token) && (
        <TokenAmount>
          <Amount tokenId={tokenId} value={BigInt(amount)} fullPrecision />
          {isFT(token) && <FiatAmount symbol={token.symbol} amount={BigInt(amount)} decimals={token.decimals} />}
        </TokenAmount>
      )}
    </AssetAmountRowStyled>
  )
}

interface FiatAmountProps {
  symbol: string
  amount: bigint
  decimals: number
}

const FiatAmount = ({ symbol, amount, decimals }: FiatAmountProps) => {
  const { data: tokenPrice, isLoading: isLoadingTokenPrice } = useFetchTokenPrice(symbol)

  const worth = isNumber(tokenPrice) ? calculateAmountWorth(amount, tokenPrice, decimals) : undefined

  return <FiatAmountStyled value={worth} isFiat isLoading={isLoadingTokenPrice} />
}

const FiatAmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--font-weight-medium);
`

const AssetAmountRowStyled = styled.div`
  display: flex;
  padding: 18px 15px;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`

const TokenName = styled.span`
  font-size: 13px;
  font-weight: var(--fontWeight-medium);
`

const LogoAndName = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
`

const TokenAmount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
`
