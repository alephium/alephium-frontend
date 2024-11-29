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

import { motion } from 'framer-motion'
import { ChevronLeft, LucideIcon, X } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
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
  isLoading?: boolean
  header?: ReactNode
  transparentHeader?: boolean
  fullScreen?: boolean
  narrow?: boolean
  dynamicContent?: boolean
  onBack?: () => void
  noPadding?: boolean
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
  transparentHeader = false,
  fullScreen = false,
  narrow = false,
  dynamicContent = false,
  onBack,
  children,
  skipFocusOnMount,
  noPadding,
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
      <CenteredBox role="dialog" {...fadeInOutScaleFast} narrow={narrow} fullScreen={fullScreen}>
        <ModalHeader transparent={transparentHeader}>
          <TitleRow>
            {onBack && !disableBack && (
              <BackButton aria-label={t('Back')} squared role="secondary" transparent onClick={onBack} borderless>
                <ChevronLeft />
              </BackButton>
            )}
            {Icon && (
              <IconContainer>
                <Icon />
              </IconContainer>
            )}
            <PanelTitle size="small" useLayoutId={false}>
              <span ref={elRef} tabIndex={0} role="heading">
                {title}
              </span>
              {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
            </PanelTitle>
            <CloseButton
              aria-label={t('Close')}
              squared
              role="secondary"
              transparent
              onClick={rest.onClose ?? onClose}
              borderless
            >
              <X />
            </CloseButton>
          </TitleRow>
          {header && <ModalHeaderContent>{header}</ModalHeaderContent>}
        </ModalHeader>
        {dynamicContent ? (
          noPadding ? (
            children
          ) : (
            <ModalContent>{children}</ModalContent>
          )
        ) : (
          <ScrollableModalContent>{children}</ScrollableModalContent>
        )}

        {isLoading && (
          <>
            <ModalBackdrop light />
            <ModalLoadingSpinner>
              <Spinner />
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
  <Scrollbar translateContentSizeYToHolder>
    <ModalContent>{children}</ModalContent>
  </Scrollbar>
)

export const HeaderContent = styled(Section)`
  flex: 0;
  margin-bottom: var(--spacing-4);
`

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

  position: relative;

  width: 100%;
  margin: auto;
  max-width: ${({ narrow }) => (narrow ? '380px' : '600px')};
  max-height: 90vh;
  overflow: hidden;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border-radius: var(--radius-huge);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background1};

  ${TitleContainer} {
    flex: 1;
    margin: var(--spacing-3) var(--spacing-4);
  }

  ${({ fullScreen }) =>
    fullScreen &&
    css`
      max-height: 92vw;
      max-width: 95vw;
      height: 92vh;
      width: 95vw;
    `}
`

export const ModalHeader = styled.header<{ transparent?: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1;
  ${({ transparent }) =>
    !transparent &&
    css`
      background-color: ${({ theme }) => theme.bg.background2};
      border-bottom: 1px solid ${({ theme }) => theme.border.primary};
    `}
`

const ModalHeaderContent = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  margin-right: var(--spacing-2);
`

const BackButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  margin-left: var(--spacing-2);
`

export const ModalContent = styled.div<{ noBottomPadding?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4) var(--spacing-6);
  width: 100%;

  ${({ noBottomPadding }) =>
    noBottomPadding &&
    css`
      padding-bottom: 0;
    `}
`

export const ModalFooterButtons = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: var(--spacing-4);
  background-color: ${({ theme }) => theme.bg.background1};
`

export const ModalFooterButton = ({ ...props }) => (
  <ModalFooterButtonStyled {...props}>{props.children}</ModalFooterButtonStyled>
)

const ModalFooterButtonStyled = styled(Button)`
  width: 100%;
  max-width: none;
`

const ModalSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
  margin-top: var(--spacing-1);
`

const ModalLoadingSpinner = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

const IconContainer = styled.div`
  margin: var(--spacing-3) 0 var(--spacing-3) var(--spacing-4);
`
