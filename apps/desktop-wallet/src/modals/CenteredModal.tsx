import { motion } from 'framer-motion'
import { ChevronLeft, LucideIcon, X } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeInOutBottomFast } from '@/animations'
import Button from '@/components/Button'
import { Section } from '@/components/PageComponents/PageContainers'
import PanelTitle, { TitleContainer } from '@/components/PageComponents/PanelTitle'
import Scrollbar from '@/components/Scrollbar'
import Spinner from '@/components/Spinner'
import Tooltip from '@/components/Tooltip'
import { closeModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import ModalContainer, { ModalBackdrop, ModalContainerProps } from '@/modals/ModalContainer'

export interface CenteredModalProps extends ModalContainerProps {
  title?: ReactNode
  subtitle?: string
  isLoading?: boolean | string
  header?: ReactNode
  fullScreen?: boolean
  narrow?: boolean
  dynamicContent?: boolean
  onBack?: () => void
  noPadding?: boolean
  hasFooterButtons?: boolean
  disableBack?: boolean
  Icon?: (() => ReactNode) | LucideIcon
}

const CenteredModal: FC<CenteredModalProps> = ({
  id,
  title,
  subtitle,
  focusMode,
  isLoading,
  header,
  fullScreen = false,
  narrow = false,
  dynamicContent = false,
  onBack,
  children,
  skipFocusOnMount,
  noPadding,
  hasFooterButtons,
  disableBack,
  Icon,
  ...rest
}) => {
  const { t } = useTranslation()
  const elRef = useFocusOnMount<HTMLSpanElement>(skipFocusOnMount)
  const dispatch = useAppDispatch()

  const onClose = id ? () => dispatch(closeModal({ id })) : undefined

  return (
    <ModalContainer id={id} focusMode={focusMode} hasPadding skipFocusOnMount={skipFocusOnMount} {...rest}>
      <CenteredBox role="dialog" {...fadeInOutBottomFast} narrow={narrow} fullScreen={fullScreen}>
        <ModalHeader>
          <TitleRow>
            {onBack && !disableBack && (
              <BackButton aria-label={t('Back')} circle role="secondary" transparent onClick={onBack}>
                <ChevronLeft />
              </BackButton>
            )}
            {Icon && (
              <IconContainer>
                <Icon />
              </IconContainer>
            )}
            <PanelTitle size="small">
              <span ref={elRef} tabIndex={0} role="heading">
                {title}
              </span>
              {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
            </PanelTitle>
            <CloseButton
              aria-label={t('Close')}
              circle
              role="secondary"
              onClick={rest.onClose ?? onClose}
              Icon={X}
              tiny
            />
          </TitleRow>
          {header && <ModalHeaderContent>{header}</ModalHeaderContent>}
        </ModalHeader>
        {dynamicContent ? (
          noPadding ? (
            children
          ) : (
            <ModalContent hasFooterButtons={hasFooterButtons}>{children}</ModalContent>
          )
        ) : (
          <ScrollableModalContent>{children}</ScrollableModalContent>
        )}

        {isLoading && (
          <>
            <ModalBackdrop light blur />
            <ModalLoadingSpinner>
              <Spinner />
              {typeof isLoading === 'string' && <ModalLoadingText>{isLoading}</ModalLoadingText>}
            </ModalLoadingSpinner>
          </>
        )}
      </CenteredBox>
      <Tooltip />
    </ModalContainer>
  )
}

export default CenteredModal

export const ScrollableModalContent = ({ children }: Pick<CenteredModalProps, 'children'>) => (
  <ModalContent>
    <Scrollbar>{children}</Scrollbar>
  </ModalContent>
)

export const HeaderContent = styled(Section)``

export const HeaderLogo = styled.div`
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const CenteredBox = styled(motion.div)<{ narrow: boolean; fullScreen: boolean }>`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border.primary};

  position: relative;

  width: 100%;
  margin: auto;
  max-width: ${({ narrow }) => (narrow ? '380px' : '440px')};
  max-height: 90vh;
  overflow: hidden;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.background1};

  ${TitleContainer} {
    flex: 1;
  }

  ${({ fullScreen }) =>
    fullScreen &&
    css`
      max-height: 90vw;
      max-width: 90vw;
      height: 90vh;
      width: 90vw;
    `}
`

export const ModalHeader = styled.header`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 5px 0 var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.background2};
`

const ModalHeaderContent = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`

const TitleRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  margin-right: var(--spacing-1);
`

const BackButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  margin-left: var(--spacing-2);
`

export const ModalContent = styled.div<{ hasFooterButtons?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 70px var(--spacing-4) var(--spacing-6) var(--spacing-4);
  width: 100%;
  overflow-y: auto;

  ${({ hasFooterButtons }) =>
    hasFooterButtons &&
    css`
      padding-bottom: 0;
    `}
`

export const ModalFooterButtons = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-top: var(--spacing-5);
  padding-bottom: var(--spacing-2);
  background: linear-gradient(to top, ${({ theme }) => theme.bg.background1} 50%, transparent 100%);
`

export const ModalFooterButton = ({ ...props }) => (
  <ModalFooterButtonStyled tall {...props}>
    {props.children}
  </ModalFooterButtonStyled>
)

const ModalFooterButtonStyled = styled(Button)`
  width: 100%;
  max-width: none;
  border-radius: 14px;
`

const ModalSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 13px;
  margin-top: var(--spacing-1);
`

const ModalLoadingSpinner = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const IconContainer = styled.div`
  margin: var(--spacing-3) 0 var(--spacing-3) var(--spacing-4);
`

const ModalLoadingText = styled.div`
  font-size: 13px;
  margin-top: var(--spacing-3);
`
