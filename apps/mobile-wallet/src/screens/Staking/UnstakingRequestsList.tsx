import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import useFetchAddressUnstakeRequests from '~/features/staking/hooks/useFetchAddressUnstakeRequests'
import usePendingStakingTransaction from '~/features/staking/hooks/usePendingStakingTransaction'

import UnstakingRequestItem from './UnstakingRequestItem'

const UnstakingRequestsList = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { data: unstakeRequests, isLoading, isError, error, refetch, isRefetching } = useFetchAddressUnstakeRequests()
  const pendingTx = usePendingStakingTransaction()

  const showSpinner = isLoading || isRefetching || !!pendingTx
  const errorMessage: string = error instanceof Error ? error.message : String(error ?? '')

  return (
    <Container>
      <TitleRow>
        <SectionTitle color="secondary">
          {t('Pending unstakings')} ({unstakeRequests.length})
        </SectionTitle>
        {showSpinner && <ActivityIndicator size="small" color={theme.font.tertiary} />}
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
