import { Minus, Square, X } from 'lucide-react'
import styled from 'styled-components'

import { appHeaderHeightPx } from '@/style/globalStyles'

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
    <TitleBarContainer>
      <DragRegion />
      <WindowControls>
        <ControlButton onClick={handleMinimize}>
          <IconStyled>
            <Minus size={16} strokeWidth={1.5} />
          </IconStyled>
        </ControlButton>
        <ControlButton onClick={handleMaximize}>
          <IconStyled>
            <Square size={13} strokeWidth={1.5} />
          </IconStyled>
        </ControlButton>
        <CloseButton onClick={handleClose}>
          <IconStyled>
            <X size={16} strokeWidth={1.5} />
          </IconStyled>
        </CloseButton>
      </WindowControls>
    </TitleBarContainer>
  )
}

export default TitleBar

const IconStyled = styled.div`
  color: ${({ theme }) => theme.font.primary};
  display: flex;
  align-items: center;
`

const DragRegion = styled.div`
  flex: 1;
`

const WindowControls = styled.div`
  display: flex;
  -webkit-app-region: no-drag;
`

const TitleBarContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: ${appHeaderHeightPx}px;
  width: 100%;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
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
  }
`

const CloseButton = styled(ControlButton)`
  &:hover {
    background-color: ${({ theme }) => theme.global.alert};
  }
`
