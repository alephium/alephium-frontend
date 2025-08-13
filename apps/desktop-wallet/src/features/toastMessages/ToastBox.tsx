import { colord } from 'colord'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeInTop, fadeOut } from '@/animations'
import Button from '@/components/Button'
import { ToastType } from '@/features/toastMessages/toastMessagesTypes'

interface ToastBoxProps {
  onClose: () => void
  title: string
  type: ToastType
  className?: string
  LeftContent?: ReactNode
  FooterButtons?: ReactNode
  children?: ReactNode
}

const ToastBox = ({ title, children, FooterButtons, onClose, LeftContent, ...props }: ToastBoxProps) => {
  const { t } = useTranslation()

  return (
    <ToastBoxStyled {...fadeInTop} {...fadeOut} {...props}>
      <ToastBoxContent>
        <ContentRow>
          {LeftContent && <LeftContentRow>{LeftContent}</LeftContentRow>}

          <CenterContent>
            <TitleRow>
              <Title>{title}</Title>
              <ButtonStyled
                aria-label={t('Close')}
                circle
                role="secondary"
                transparent
                onClick={onClose}
                Icon={X}
                tiny
              />
            </TitleRow>

            <ChildrenContent>{children}</ChildrenContent>
          </CenterContent>
        </ContentRow>

        {FooterButtons && <ButtonsRow>{FooterButtons}</ButtonsRow>}
      </ToastBoxContent>
    </ToastBoxStyled>
  )
}

export default ToastBox

const ToastBoxStyled = styled(motion.div)<{ type: ToastType }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;

  background-color: ${({ theme }) => theme.bg.background1};
  border-radius: var(--radius-medium);

  ${({ type, theme }) => {
    switch (type) {
      case 'error':
        return getToastBoxStyle(theme.global.alert)
      case 'info':
        return getToastBoxStyle(theme.global.accent)
      case 'success':
        return getToastBoxStyle(theme.global.valid)
    }
  }}
`

const ToastBoxContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  font-size: 14px;
  color: ${({ theme }) => theme.font.primary};
  word-break: break-word;
  overflow-y: auto;
  font-weight: var(--fontWeight-semiBold);
  pointer-events: all;
  z-index: 1;
  padding: 8px var(--spacing-4);
  border-radius: var(--radius-medium);
  width: 100%;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);

  -webkit-app-region: no-drag;
`

const getToastBoxStyle = (color: string) => css`
  ${ToastBoxContent} {
    background-color: ${colord(color).alpha(0.1).toHex()};
    border: 1px solid
      ${({ theme }) =>
        theme.name === 'light' ? colord(color).alpha(0.1).toHex() : colord(color).alpha(0.2).lighten(0.1).toHex()};
    color: ${({ theme }) =>
      theme.name === 'light' ? colord(color).toHex() : colord(color).alpha(1).lighten(0.1).toHex()};

    svg {
      stroke: ${({ theme }) => (theme.name === 'light' ? colord(color).toHex() : colord(color).alpha(1).lighten(0.1).toHex())};};
    }
  }
`

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-2);
  flex: 1;
`

const Title = styled.div`
  font-weight: var(--fontWeight-semiBold);
  max-height: 20vh;
  margin-top: var(--spacing-1);
  word-break: break-word;
`

const ContentRow = styled.div`
  display: flex;
  gap: var(--spacing-4);
`

const ButtonsRow = styled.div``

const CenterContent = styled.div`
  flex: 1;
`

const ChildrenContent = styled.div`
  flex: 1;
  font-weight: var(--fontWeight-medium);
  word-break: break-word;
`

const ButtonStyled = styled(Button)`
  margin-right: -12px;
`

const LeftContentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: stretch;
`
