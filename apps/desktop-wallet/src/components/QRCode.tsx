import { CopyIcon } from 'lucide-react'
import { useCallback } from 'react'
import RawQRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import { useAppDispatch } from '@/hooks/redux'
import { copiedToClipboard, copyToClipboardFailed } from '@/storage/global/globalActions'

interface QRCodeProps {
  value: string
  size: number
  copyButtonLabel?: string
  className?: string
}

const QRCode = ({ value, size, copyButtonLabel, className }: QRCodeProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const handleCopyAddressToClipboard = useCallback(() => {
    if (!value) {
      dispatch(copyToClipboardFailed())
    } else {
      navigator.clipboard
        .writeText(value)
        .catch((e) => {
          throw e
        })
        .then(() => {
          dispatch(copiedToClipboard())
        })
    }
  }, [dispatch, value])

  return (
    <div className={className}>
      <StyledBox size={size}>
        <RawQRCode size={size} value={value} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
      </StyledBox>
      {copyButtonLabel && (
        <Button role="secondary" Icon={CopyIcon} onClick={handleCopyAddressToClipboard}>
          {copyButtonLabel}
        </Button>
      )}
    </div>
  )
}

export default styled(QRCode)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const StyledBox = styled.div<{ size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-big);
  width: ${({ size }) => size + 25}px;
  height: ${({ size }) => size + 25}px;
  backdrop-filter: blur(10px) brightness(${({ theme }) => (theme.name === 'light' ? '1.3' : '1.5')}) saturate(1.2);
  overflow: hidden;
`
