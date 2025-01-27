import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import styled from 'styled-components'

import { dAppQuery } from '~/api/queries/dAppQueries'
import { DAppProps } from '~/features/ecosystem/ecosystemTypes'
import { BORDER_RADIUS } from '~/style/globalStyle'

interface DAppIconProps extends DAppProps {
  size?: number
}

const DAppIcon = ({ dAppName, size = 70 }: DAppIconProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))

  if (!dApp) return null

  return <DappIconStyled source={{ uri: dApp.media.logoUrl }} contentFit="cover" size={size} />
}

export default DAppIcon

const DappIconStyled = styled(Image)<Pick<DAppIconProps, 'size'>>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: ${BORDER_RADIUS}px;
`
