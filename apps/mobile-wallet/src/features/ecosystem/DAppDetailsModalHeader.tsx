import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components/native'

import { dAppQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import DAppIcon from '~/features/ecosystem/DAppIcon'
import { DAppProps } from '~/features/ecosystem/ecosystemTypes'

const DAppDetailsModalHeader = ({ dAppName }: DAppProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))

  if (!dApp) return null

  return (
    <DAppDetailsModalHeaderStyled>
      <DAppIcon dAppName={dAppName} size={26} />
      <DAppName bold truncate size={16}>
        {dAppName}
      </DAppName>
    </DAppDetailsModalHeaderStyled>
  )
}

export default DAppDetailsModalHeader

const DAppDetailsModalHeaderStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`

const DAppName = styled(AppText)`
  flex: 1;
  overflow: hidden;
`
