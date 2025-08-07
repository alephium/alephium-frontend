import styled, { css, DefaultTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '~/style/globalStyle'

interface SurfaceProps {
  type?: keyof DefaultTheme['bg']
  withPadding?: boolean
}

export default styled.View<SurfaceProps>`
  background-color: ${({ theme, type }) => (type ? theme.bg[type] : 'transparent')};
  border-radius: ${BORDER_RADIUS}px;
  overflow: hidden;
  ${({ withPadding }) =>
    withPadding &&
    css`
      padding: 20px;
    `}
`
