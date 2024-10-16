/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { CloseButton } from '~/components/buttons/Button'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BottomModalHeaderProps {
  handleClose: () => void
  height?: number
  title?: string
}

const BottomModalHeader = ({ height, handleClose, title }: BottomModalHeaderProps) => (
  <HeaderContainer style={{ height }}>
    <HeaderSideContainer align="left" />
    {title && <Title semiBold>{title}</Title>}
    <HeaderSideContainer align="right">
      <CloseButton onPress={handleClose} compact />
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
