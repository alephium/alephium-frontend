import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import Amount from '@/components/Amount'

interface TotalAlphBalanceProps {
  type: 'available' | 'locked'
  className?: string
}

const TotalAlphBalance = ({ className, type }: TotalAlphBalanceProps) => {
  const { t } = useTranslation()

  const available = type === 'available'

  return (
    <div className={className}>
      <BalanceLabel tabIndex={0} role="representation">
        {t(available ? 'Available' : 'Locked')}
      </BalanceLabel>
      {available ? <AvailableAlphAmount /> : <LockedAlphAmount />}
    </div>
  )
}

const AvailableAlphAmount = () => {
  const { data, isLoading } = useFetchWalletBalancesAlph()

  const value = data?.availableBalance ? BigInt(data.availableBalance) : undefined

  return <AmountStyled tokenId={ALPH.id} tabIndex={0} value={value} isLoading={isLoading} loaderHeight={30} />
}

const LockedAlphAmount = () => {
  const { data, isLoading } = useFetchWalletBalancesAlph()

  const value = data?.lockedBalance ? BigInt(data.lockedBalance) : undefined

  return <AmountStyled tokenId={ALPH.id} tabIndex={0} value={value} isLoading={isLoading} loaderHeight={30} />
}

export default TotalAlphBalance

const BalanceLabel = styled.label`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  display: block;
  margin-bottom: 3px;
`

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 21px;
  font-weight: var(--fontWeight-semiBold);
`
