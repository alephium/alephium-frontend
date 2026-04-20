import { AddressHash } from '@alephium/shared'
import { queryClient } from '@alephium/shared-react'
import { Fragment, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useFetchAddressUnstakeRequests, {
  unstakeVaultRequestsQueryKeyRoot
} from '~/features/staking/hooks/useFetchAddressUnstakeRequests'
import { stakeOrUnstakeCompleted } from '~/features/staking/stakingSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import PendingStakingActionPollerIndicator from '~/screens/Staking/PendingStakingActionPollerIndicator'
import { showToast } from '~/utils/layout'

import UnstakingRequestItem from './UnstakingRequestItem'

interface UnstakingRequestsListProps {
  addressHash: AddressHash
}

const UnstakingRequestsList = ({ addressHash }: UnstakingRequestsListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    data: unstakeRequests,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useFetchAddressUnstakeRequests({ addressHash })

  const errorMessage: string = error instanceof Error ? error.message : String(error ?? '')

  const pendingStakeOrUnstake = useAppSelector((s) => s.staking.pendingStakeOrUnstake)

  const handleUnstakeTxConfirmed = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] })
    await queryClient.invalidateQueries({ queryKey: unstakeVaultRequestsQueryKeyRoot })
    dispatch(stakeOrUnstakeCompleted())
    showToast({ type: 'success', text1: t('Unstake request opened!') })
  }, [addressHash, dispatch, t])

  return (
    <Container>
      <TitleRow>
        <SectionTitle color="secondary">
          {t('Pending unstakings')} ({unstakeRequests.length})
        </SectionTitle>
        {pendingStakeOrUnstake?.type === 'unstake' && (
          <PendingStakingActionPollerIndicator
            txHash={pendingStakeOrUnstake.txHash}
            onTxConfirmed={handleUnstakeTxConfirmed}
          />
        )}
      </TitleRow>
      {isError ? (
        <Fragment>
          <EmptyText color="secondary">{errorMessage}</EmptyText>
          <RetryText color="accent" onPress={() => refetch()}>
            {isRefetching ? '…' : t('Tap to retry')}
          </RetryText>
        </Fragment>
      ) : unstakeRequests.length > 0 ? (
        <ListContainer>
          {unstakeRequests.map((req) => (
            <UnstakingRequestItem key={req.vaultIndex.toString()} request={req} addressHash={addressHash} />
          ))}
        </ListContainer>
      ) : (
        <EmptyText color="secondary">{isLoading ? '...' : t('No pending unstakings')}</EmptyText>
      )}
    </Container>
  )
}

export default UnstakingRequestsList

const Container = styled.View`
  gap: 12px;
`

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

const SectionTitle = styled(AppText)`
  font-size: 16px;
  font-weight: 600;
`

const ListContainer = styled.View`
  gap: 10px;
`

const EmptyText = styled(AppText)`
  font-size: 14px;
`

const RetryText = styled(AppText)`
  font-size: 14px;
  margin-top: 8px;
`
