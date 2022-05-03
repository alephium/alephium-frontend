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

import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { PressableProps } from 'react-native'
import { useTheme } from 'styled-components'
import styled, { css } from 'styled-components/native'

import Button from './Button'

interface HighlightButtonProps extends PressableProps {
  title: string
  wide?: boolean
}

const HighlightButton = ({ title, wide }: HighlightButtonProps) => {
  const { yellow, orange, red, purple, cyan } = useTheme().gradient

  return (
    <ButtonWrapper
      from={{ scale: 1 }}
      animate={{ scale: 1.01 }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 500
      }}
    >
      <Button title={title} wide={wide}>
        <GradientContainer
          from={{ scale: 1 }}
          animate={{ scale: 1.5 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 500
          }}
        >
          <StyledLinearGradient colors={[yellow, orange, red, purple, cyan]} end={{ x: 1, y: 1 }} />
        </GradientContainer>
      </Button>
    </ButtonWrapper>
  )
}

const ButtonWrapper = styled(MotiView)`
  width: 100%;
  align-items: center;
`

const fullScreen = css`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

const GradientContainer = styled(MotiView)`
  ${fullScreen}
  z-index: -1;
`

const StyledLinearGradient = styled(LinearGradient)`
  ${fullScreen}
`

export default HighlightButton
