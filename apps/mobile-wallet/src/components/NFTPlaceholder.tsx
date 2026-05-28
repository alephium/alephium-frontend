import Lucide, { LucideIconName } from '@react-native-vector-icons/lucide/static'
import { DimensionValue } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface NFTPlaceholderProps {
  size?: DimensionValue
  iconName?: LucideIconName
  text?: string
}

const NFTPlaceholder = ({ size = '100%', iconName, text }: NFTPlaceholderProps) => {
  const theme = useTheme()

  return (
    <NoImage style={{ width: size, height: size }}>
      {iconName && <Lucide name={iconName} color={theme.global.gray} size={30} />}
      {text && (
        <AppText color={theme.global.gray} size={10}>
          {text}
        </AppText>
      )}
    </NoImage>
  )
}

export default NFTPlaceholder

const NoImage = styled.View`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.secondary};
  aspect-ratio: 1;
`
