import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useFetchAddressUnstakeRequests, { UnstakeRequest } from '~/features/staking/hooks/useFetchAddressUnstakeRequests'

import UnstakingRequestItem from './UnstakingRequestItem'

const UnstakingRequestsList = () => {
  const { t } = useTranslation()
  const { data: unstakeRequests } = useFetchAddressUnstakeRequests()

  if (!unstakeRequests.length) return null

  return (
    <Container>
      <SectionTitle color="secondary">
        {t('Pending unstakings')} ({unstakeRequests.length})
      </SectionTitle>
      <ListContainer>
        {unstakeRequests.map((req: UnstakeRequest) => (
          <UnstakingRequestItem key={req.vaultIndex.toString()} request={req} />
        ))}
      </ListContainer>
    </Container>
  )
}

export default UnstakingRequestsList

const Container = styled.View`
  gap: 12px;
`

const SectionTitle = styled(AppText)`
  font-size: 16px;
  font-weight: 600;
`

const ListContainer = styled.View`
  gap: 10px;
`
