import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import Badge from '@/components/Badge'
import HashEllipsed from '@/components/HashEllipsed'
import { TableCell } from '@/components/Table'
import Truncate from '@/components/Truncate'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import { isFT, isUnlistedFT } from '@/types/tokens'

export const FTNameCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <TableCell>
      <TokenName>
        <Truncate>{token.name}</Truncate>

        {isUnlistedFT(token) && (
          <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
            i
          </InfoIcon>
        )}
      </TokenName>
    </TableCell>
  )
}

export const NSTNameCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()

  return (
    <TableCell>
      <TokenName style={{ maxWidth: 180 }}>
        <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} />
        <Badge compact>{t('Unknown')}</Badge>
      </TokenName>
    </TableCell>
  )
}

const TokenName = styled(Truncate)`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
  gap: 5px;
  margin-right: 10px;
`

const InfoIcon = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 14px;
  width: 14px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-radius: 50%;
  cursor: default;
  margin-left: 6px;
`
