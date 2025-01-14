import { ReactNode } from 'react'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { CloseButton } from '~/components/buttons/Button'
import { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BottomModalHeaderProps {
  onClose: () => void
  height?: number
  title?: string | ReactNode
  titleAlign?: BottomModalBaseProps['titleAlign']
}

const BottomModalHeader = ({ height, onClose, title, titleAlign = 'center' }: BottomModalHeaderProps) => (
  <HeaderContainer style={{ height }}>
    {titleAlign !== 'left' && <HeaderSideContainer align="left" />}
    <HeaderTitleOutterContainer>
      <TitleContainer titleAlign={titleAlign}>
        {title &&
          (typeof title === 'string' ? (
            <Title semiBold size={16}>
              {title}
            </Title>
          ) : (
            title
          ))}
      </TitleContainer>
    </HeaderTitleOutterContainer>
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

const HeaderTitleOutterContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`

const TitleContainer = styled.View<{ titleAlign: BottomModalHeaderProps['titleAlign'] }>`
  padding: ${({ titleAlign }) => (titleAlign === 'center' ? '0 20px' : '0 20px 0 0')};
  align-items: center;
  justify-content: ${({ titleAlign }) => (titleAlign === 'center' ? 'center' : 'flex-start')};
`

const Title = styled(AppText)`
  text-align: center;
`
