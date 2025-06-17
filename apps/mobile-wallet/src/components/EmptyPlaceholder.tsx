import { ViewProps } from 'react-native'
import styled, { css } from 'styled-components/native'

import Box from '~/components/layout/Box'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export type EmptyPlaceholderProps = ViewProps & {
  noMargin?: boolean
  hasHorizontalMargin?: boolean
  hasVerticalMargin?: boolean
}

const EmptyPlaceholder = ({ children, ...props }: EmptyPlaceholderProps) => (
  <BoxStyled {...props}>
    <Content>{children}</Content>
  </BoxStyled>
)

export default EmptyPlaceholder

const BoxStyled = styled(Box)<EmptyPlaceholderProps>`
  justify-content: center;

  margin-top: ${({ hasVerticalMargin }) => (hasVerticalMargin ? VERTICAL_GAP / 2 : 0)}px;
  margin-bottom: ${({ hasVerticalMargin }) => (hasVerticalMargin ? VERTICAL_GAP / 2 : 0)}px;
  margin-left: ${({ hasHorizontalMargin }) => (hasHorizontalMargin ? DEFAULT_MARGIN : 0)}px;
  margin-right: ${({ hasHorizontalMargin }) => (hasHorizontalMargin ? DEFAULT_MARGIN : 0)}px;

  ${({ noMargin }) =>
    noMargin &&
    css`
      margin: 0;
    `}
`

const Content = styled.View`
  align-items: center;
  gap: 10px;
`
