/*
Copyright 2018 - 2022 The Alephium Authors
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

import { Canvas, Circle, SweepGradient, vec } from '@shopify/react-native-skia'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AlephiumLogo from '~/images/logos/AlephiumLogo'

interface WalletSwitchButtonProps {
  isLoading: boolean
  style?: StyleProp<ViewStyle>
}

const buttonSize = 40

const WalletSwitchButton = ({ isLoading, style }: WalletSwitchButtonProps) => {
  const Gradient = (
    <SweepGradient c={vec(buttonSize / 2, buttonSize / 2)} colors={['#FF4385', '#61A1F6', '#FF7D26', '#FF4385']} />
  )
  return (
    <Container style={style}>
      <AlephiumLogo color="white" />
      <BackgroundCanvas style={{ height: 40, width: 40 }}>
        <Circle cx={buttonSize / 2} cy={buttonSize / 2} r={buttonSize / 2}>
          {Gradient}
        </Circle>
      </BackgroundCanvas>
    </Container>
  )
}

export default WalletSwitchButton

const Container = styled.View`
  padding: 7px;
  height: ${buttonSize}px;
  width: ${buttonSize}px;
  border-radius: ${buttonSize}px;
  background-color: ${({ theme }) => theme.bg.contrast};
`

const BackgroundCanvas = styled(Canvas)`
  position: absolute;
  height: ${buttonSize}px;
  width: ${buttonSize}px;
  z-index: -1;
`
