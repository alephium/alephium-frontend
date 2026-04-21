import { AddressHash, formatAmountForDisplay } from '@alephium/shared'
import { queryClient } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useStakedValue from '~/features/staking/hooks/useStakedValue'
import { stakeOrUnstakeCompleted } from '~/features/staking/stakingSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import AmountSkeleton from '~/screens/Staking/AmountSkeleton'
import PendingStakingActionPollerIndicator from '~/screens/Staking/PendingStakingActionPollerIndicator'
import { showToast } from '~/utils/layout'

interface StakingCardBalanceAlphProps {
  addressHash: AddressHash
}

const StakingCardBalanceAlph = ({ addressHash }: StakingCardBalanceAlphProps) => {
  const { t } = useTranslation()
  const pendingStakeOrUnstake = useAppSelector((s) => s.staking.pendingStakeOrUnstake)
  const dispatch = useAppDispatch()

  const { data: stakedValueAlph, isLoading: isStakedValueLoading } = useStakedValue(addressHash)

  const formattedStakedValue = formatAmountForDisplay({ amount: stakedValueAlph, amountDecimals: ALPH.decimals })

  const handleTxConfirmed = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] })
    dispatch(stakeOrUnstakeCompleted())
    showToast({ type: 'success', text1: t('ALPH staked successfully!') })
  }, [addressHash, dispatch, t])

  return (
    <ValueRow>
      <Value>{isStakedValueLoading ? <AmountSkeleton height={35} /> : `${formattedStakedValue} ${ALPH.symbol}`}</Value>

      {pendingStakeOrUnstake?.type === 'stake' && (
        <PendingStakingActionPollerIndicator txHash={pendingStakeOrUnstake.txHash} onTxConfirmed={handleTxConfirmed} />
      )}
    </ValueRow>
  )
}

export default StakingCardBalanceAlph

const Value = styled(AppText)`
  font-size: 28px;
  font-weight: 700;
  color: white;
`

const ValueRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`
