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
import styled, { useTheme } from 'styled-components'

const TitleBar = () => {
  const theme = useTheme()

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
    <TitleBarContainer>
      <DragRegion />
      <WindowControls>
        <ControlButton onClick={handleMinimize}>
          <IconStyled>
            <Minus size={16} />
          </IconStyled>
        </ControlButton>
        <ControlButton onClick={handleMaximize}>
          <IconStyled>
            <Square size={16} />
          </IconStyled>
        </ControlButton>
        <CloseButton onClick={handleClose}>
          <IconStyled>
            <X size={16} />
          </IconStyled>
        </CloseButton>
      </WindowControls>
    </TitleBarContainer>
  )
}

const IconStyled = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const DragRegion = styled.div`
  flex: 1;
`

const WindowControls = styled.div`
  display: flex;
  -webkit-app-region: no-drag;
`

const TitleBarContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 32px;
  width: 100%;
  display: flex;
  -webkit-app-region: drag;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const ControlButton = styled.button`
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

    ${IconStyled} {
      color: ${({ theme }) => theme.font.primary};
    }
  }
`

const CloseButton = styled(ControlButton)`
  &:hover {
    background-color: ${({ theme }) => theme.global.alert};

    ${IconStyled} {
      color: ${({ theme }) => theme.font.primary};
    }
  }
`

export default TitleBar
