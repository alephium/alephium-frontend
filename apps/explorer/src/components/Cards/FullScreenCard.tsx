import { HTMLMotionProps, motion } from 'framer-motion'
import { ReactNode, useEffect } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import styled from 'styled-components'

import { isMobile } from '@/utils/browserSupport'

interface FullScreenCardProps extends HTMLMotionProps<'div'> {
  label: string
  onClose: () => void
  children: ReactNode
}

const FullScreenCard = ({ children, label, onClose, layoutId, ...props }: FullScreenCardProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const animationConfig = isMobile()
    ? {
        initial: {
          opacity: 0
        },
        animate: {
          opacity: 1
        },
        exit: {
          opacity: 0
        }
      }
    : {
        layoutId
      }

  return (
    <Container>
      <CardContent {...props} {...animationConfig}>
        <Header>
          <LabelText>{label}</LabelText>
          <CloseButton onClick={onClose} />
        </Header>
        <Content>{children}</Content>
      </CardContent>
      <Backdrop onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    </Container>
  )
}

export default FullScreenCard

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const CardContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 800px;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 8px;
  overflow: hidden;
  margin: 0 2vw;
  border: 1px solid ${({ theme }) => theme.border.primary};

  @media (max-aspect-ratio: 2/3) {
    height: 60%;
  }
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
`

const Header = styled.div`
  height: 50px;
  padding: 20px;
  display: flex;
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CloseButton = styled(RiCloseLine)`
  cursor: pointer;
  color: ${({ theme }) => theme.font.primary};

  :hover {
    color: ${({ theme }) => theme.font.secondary};
  }
`

const LabelText = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
`

const Content = styled.div`
  flex: 1;
  padding: 20px;
`
