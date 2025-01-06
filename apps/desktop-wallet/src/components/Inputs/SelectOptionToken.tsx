import { ReactNode } from 'react'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import SelectOptionTokenName from '@/components/Inputs/SelectOptionTokenName'
import Truncate from '@/components/Truncate'
import { TokenId } from '@/types/tokens'

export interface SelectOptionTokenBaseProps {
  tokenId: TokenId
  isSelected?: boolean
  className?: string
}

interface SelectOptionTokenProps extends SelectOptionTokenBaseProps {
  isLoading: boolean
  showAmount?: boolean
  amount?: bigint
  children?: ReactNode
}

const SelectOptionToken = ({
  tokenId,
  showAmount,
  isLoading,
  amount,
  isSelected,
  className
}: SelectOptionTokenProps) => (
  <SelectOptionItemContent
    MainContent={
      <>
        <AssetName>
          <AssetLogo tokenId={tokenId} size={20} />
          <Truncate>
            <SelectOptionTokenName tokenId={tokenId} />
          </Truncate>
        </AssetName>

        {showAmount && <AmountStyled tokenId={tokenId} value={amount} isLoading={isLoading} />}
      </>
    }
    isSelected={isSelected}
    className={className}
  />
)

export default SelectOptionToken

const AssetName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 200px;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  font-weight: var(--fontWeight-semiBold);
  text-align: right;
  margin-left: auto;
  display: block;
`
