import { AddressHash } from '@alephium/shared'
import { queryClient } from '@alephium/shared-react'
import { Fragment, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useFetchAddressUnstakeRequests, {
  unstakeVaultRequestsQueryKeyRoot
} from '~/features/staking/hooks/useFetchAddressUnstakeRequests'
import { setIsCanceling, setIsClaiming, setIsUnstaking } from '~/features/staking/stakingSlice'
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

  const isUnstaking = useAppSelector((s) => s.staking.isUnstaking)
  const isCanceling = useAppSelector((s) => s.staking.isCanceling)
  const isClaiming = useAppSelector((s) => s.staking.isClaiming)

  const handleNewTxDetected = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: unstakeVaultRequestsQueryKeyRoot })

    if (isUnstaking) {
      dispatch(setIsUnstaking(false))
      showToast({ type: 'success', text1: t('Unstake request opened!') })
    } else if (isCanceling) {
      dispatch(setIsCanceling(false))
      showToast({ type: 'success', text1: t('Unstake request cancelled!') })
    } else if (isClaiming) {
      dispatch(setIsClaiming(false))
      showToast({ type: 'success', text1: t('ALPH claimed!') })
    }
  }, [dispatch, isCanceling, isClaiming, isUnstaking, t])

  return (
    <Container>
      <TitleRow>
        <SectionTitle color="secondary">
          {t('Pending unstakings')} ({unstakeRequests.length})
        </SectionTitle>
        {(isUnstaking || isCanceling || isClaiming) && addressHash && (
          <PendingStakingActionPollerIndicator addressHash={addressHash} onNewTxDetected={handleNewTxDetected} />
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
            <UnstakingRequestItem key={req.vaultIndex.toString()} request={req} />
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
