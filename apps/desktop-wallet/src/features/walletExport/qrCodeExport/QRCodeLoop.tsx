import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

// Inspired by:
// - https://github.com/LedgerHQ/ledger-live/blob/edc7cc4091969564f8fe295ff2bf0a3e425a4ba6/apps/ledger-live-desktop/src/renderer/components/Exporter/QRCodeExporter.tsx
// - https://github.com/gre/qrloop/blob/06eaa7fd23bd27e0c638b1c66666cada1bbd0d30/examples/web-text-exporter

const FPS = 5
const REFRESH_RATE = 1000 / FPS

export interface QRCodeLoopProps {
  frames: string[]
}

const QRCodeLoop = ({ frames }: QRCodeLoopProps) => {
  const theme = useTheme()

  const [visibleFrameIndex, setVisibleFrameIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setVisibleFrameIndex((prev) => (prev + 1) % frames.length), REFRESH_RATE)

    return () => clearInterval(interval)
  }, [frames.length])

  return (
    <QRCodeLoopStyled>
      <QRCode size={400} value={frames[visibleFrameIndex]} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
    </QRCodeLoopStyled>
  )
}

export default QRCodeLoop

const QRCodeLoopStyled = styled.div`
  position: relative;
  height: 400px;
  width: 100%;
  display: flex;
  justify-content: center;
`
