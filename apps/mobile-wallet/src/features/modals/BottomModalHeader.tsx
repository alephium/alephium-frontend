import { ReactNode } from 'react'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { CloseButton } from '~/components/buttons/Button'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BottomModalHeaderProps {
  onClose: () => void
  height?: number
  title?: string | ReactNode
}

const BottomModalHeader = ({ height, onClose, title }: BottomModalHeaderProps) => (
  <HeaderContainer style={{ height }}>
    <HeaderSideContainer align="left" />
    {title &&
      (typeof title === 'string' ? (
        <Title semiBold size={16}>
          {title}
        </Title>
      ) : (
        title
      ))}
    <HeaderSideContainer align="right">
      <CloseButton onPress={onClose} />
    </HeaderSideContainer>
  </HeaderContainer>
)

export default BottomModalHeader

const HeaderContainer = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${DEFAULT_MARGIN - 1}px;
`

const HeaderSideContainer = styled.View<{ align: 'right' | 'left' }>`
  width: 10%;
  flex-direction: row;
  justify-content: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
`

const Title = styled(AppText)`
  flex: 1;
  text-align: center;
`
