import { AddressHash, TokenId } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances, useFetchWalletSingleTokenBalances } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInSlowly } from '@/animations'
import FTAmounts, { FTAmountsBaseProp } from '@/components/amounts/FTAmounts'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'

interface FTAddressAmountCellProps {
  tokenId: TokenId
  addressHash: AddressHash
}

export const FTAddressAmountCell = ({ tokenId, addressHash }: FTAddressAmountCellProps) => {
  const { data: tokenBalances, isLoading } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined
  const availableBalance = tokenBalances?.availableBalance ? BigInt(tokenBalances.availableBalance) : undefined

  return (
    <FTAmountCell
      tokenId={tokenId}
      isLoading={isLoading}
      totalBalance={totalBalance}
      availableBalance={availableBalance}
    />
  )
}

export const FTWalletAmountCell = ({ tokenId }: Omit<FTAddressAmountCellProps, 'addressHash'>) => {
  const { data: tokenBalances, isLoading } = useFetchWalletSingleTokenBalances({ tokenId })

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined
  const availableBalance = tokenBalances?.availableBalance ? BigInt(tokenBalances.availableBalance) : undefined

  return (
    <FTAmountCell
      tokenId={tokenId}
      isLoading={isLoading}
      totalBalance={totalBalance}
      availableBalance={availableBalance}
    />
  )
}

const FTAmountCell = (props: FTAmountsBaseProp) => (
  <TableCell align="right" {...fadeInSlowly}>
    {props.isLoading ? (
      <SkeletonLoader height="20px" width="30%" />
    ) : (
      <AmountsContainer>
        <FTAmounts {...props} />
      </AmountsContainer>
    )}
  </TableCell>
)

export const RawAmountSubtitle = () => {
  const { t } = useTranslation()

  return <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>
}

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`

const AmountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`
