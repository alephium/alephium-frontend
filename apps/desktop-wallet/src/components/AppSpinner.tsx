import styled from 'styled-components'

import Spinner from '@/components/Spinner'
import { useAppSelector } from '@/hooks/redux'

interface AppSpinnerProps {
  className?: string
}

const AppSpinner = ({ className }: AppSpinnerProps) => {
  const loading = useAppSelector((s) => s.global.loading)

  if (!loading) return null

  return (
    <AppSpinnerStyled className={className}>
      <Spinner size="40px" />
    </AppSpinnerStyled>
  )
}

export default AppSpinner

const AppSpinnerStyled = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-black);
  background-color: ${({ theme }) => (theme.name === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')};
  backdrop-filter: blur(3px);
  z-index: 2;
`
