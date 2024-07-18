/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesAlphBalances } from '@/api/addressesBalancesDataHooks'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'

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
  const { data } = useAddressesAlphBalances()

  return <AlphBalance balance={data.balance - data.lockedBalance} />
}

const LockedAlphAmount = () => {
  const { data } = useAddressesAlphBalances()

  return <AlphBalance balance={data.lockedBalance} />
}

const AlphBalance = ({ balance }: { balance: bigint }) => {
  const { isLoading } = useAddressesAlphBalances()

  return isLoading ? <SkeletonLoader height="30px" /> : <AmountStyled tabIndex={0} value={balance} />
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
