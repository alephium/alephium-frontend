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

import { Minus, Square, X } from 'lucide-react'
import styled from 'styled-components'

const TitleBar = () => {
  const handleMinimize = () => {
    window.electron?.window.minimize()
  }

  const handleMaximize = () => {
    window.electron?.window?.maximize()
  }

  const handleClose = () => {
    window.electron?.window.close()
  }

  return (
    <Container>
      <DragRegion />
      <Controls>
        <Button onClick={handleMinimize}>
          <Icon>
            <Minus size={16} />
          </Icon>
        </Button>
        <Button onClick={handleMaximize}>
          <Icon>
            <Square size={16} />
          </Icon>
        </Button>
        <CloseButton onClick={handleClose}>
          <Icon>
            <X size={16} />
          </Icon>
        </CloseButton>
      </Controls>
    </Container>
  )
}

const Icon = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const DragRegion = styled.div`
  flex: 1;
`

const Controls = styled.div`
  display: flex;
  -webkit-app-region: no-drag;
`

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 32px;
  width: 100%;
  display: flex;
  -webkit-app-region: drag;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const Button = styled.button`
  width: 46px;
  height: 32px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.highlight};

    ${Icon} {
      color: ${({ theme }) => theme.font.primary};
    }
  }
`

const CloseButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }) => theme.global.alert};
  }
`

export default TitleBar
