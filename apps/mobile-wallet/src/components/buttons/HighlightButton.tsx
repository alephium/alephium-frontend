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

import { MotiView } from 'moti'
import styled, { useTheme } from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'

interface HighlightButtonProps extends ButtonProps {
  title: string
  wide?: boolean
}

const HighlightButton = ({ title, wide, ...props }: HighlightButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonWrapper
      from={{ scale: 1 }}
      animate={{ scale: 1.02 }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 500
      }}
    >
      <Button
        title={title}
        style={{ backgroundColor: theme.global.accent }}
        color="white"
        wide={wide}
        variant="accent"
        type="primary"
        {...props}
      />
    </ButtonWrapper>
  )
}

export default HighlightButton

const ButtonWrapper = styled(MotiView)`
  width: 100%;
  align-items: center;
`
