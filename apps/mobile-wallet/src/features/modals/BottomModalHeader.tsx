import { ReactNode } from 'react'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { CloseButton } from '~/components/buttons/Button'
import { BottomModalBaseProps } from '~/features/modals/BottomModalBase'

interface BottomModalHeaderProps {
  onClose: () => void
  height?: number
  title?: string | ReactNode
  showCloseButton?: boolean
  titleAlign?: BottomModalBaseProps['titleAlign']
}

const BottomModalHeader = ({
  height,
  onClose,
  title,
  showCloseButton,
  titleAlign = 'center'
}: BottomModalHeaderProps) => {
  if (!title && !showCloseButton) return null

  return (
    <HeaderContainer style={{ height }}>
      {titleAlign !== 'left' && showCloseButton && <HeaderSideContainer align="left" />}
      <HeaderTitleOutterContainer style={{ justifyContent: titleAlign === 'left' ? 'flex-start' : 'center' }}>
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
      {showCloseButton && (
        <HeaderSideContainer align="right">
          <CloseButton onPress={onClose} />
        </HeaderSideContainer>
      )}
    </HeaderContainer>
  )
}

export default BottomModalHeader

const HeaderContainer = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 14px;
`

const HeaderSideContainer = styled.View<{ align: 'right' | 'left' }>`
  width: 10%;
  flex-direction: row;
  justify-content: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
`

const HeaderTitleOutterContainer = styled.View`
  flex: 1;
`

const TitleContainer = styled.View<Pick<BottomModalHeaderProps, 'titleAlign' | 'showCloseButton'>>`
  padding: ${({ titleAlign, showCloseButton }) =>
    titleAlign === 'center' ? '0 20px' : showCloseButton ? '0 20px 0 0' : 0};
  align-items: ${({ titleAlign }) => (titleAlign === 'center' ? 'center' : 'flex-start')};
  justify-content: center;
`

const Title = styled(AppText)`
  text-align: center;
`
