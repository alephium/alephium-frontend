import { colord } from 'colord'
import { Info } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import { openInWebBrowser } from '@/utils/misc'

interface OperationBoxProps {
  title: string
  Icon: ReactNode
  description: string
  buttonText: string
  onButtonClick: () => void
  infoLink?: string
  placeholder?: boolean
  isButtonDisabled?: boolean
  disabledButtonTooltip?: string
  className?: string
}

const OperationBox = ({
  className,
  title,
  Icon,
  description,
  buttonText,
  onButtonClick,
  infoLink,
  placeholder,
  isButtonDisabled,
  disabledButtonTooltip
}: OperationBoxProps) => {
  const { t } = useTranslation()

  return (
    <OperationBoxStyled className={className} placeholder={placeholder}>
      <IconWrapper>{Icon}</IconWrapper>
      <div>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </div>
      <Footer data-tooltip-id="default" data-tooltip-content={disabledButtonTooltip}>
        {placeholder ? (
          <ActionLink onClick={onButtonClick}>{buttonText}</ActionLink>
        ) : (
          <Button short wide onClick={onButtonClick} style={{ minWidth: 100, margin: 0 }} disabled={isButtonDisabled}>
            {buttonText}
          </Button>
        )}
        {infoLink && (
          <ActionLink onClick={() => openInWebBrowser(infoLink)} withBackground>
            <InfoIcon size={12} /> {t('More info')}
          </ActionLink>
        )}
      </Footer>
    </OperationBoxStyled>
  )
}

export default OperationBox

const OperationBoxStyled = styled.div<Pick<OperationBoxProps, 'placeholder'>>`
  padding: var(--spacing-3);
  background-color: ${({ theme }) => theme.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-huge);
  display: flex;
  align-items: center;
  transition: box-shadow 0.1s ease-out;
  justify-content: space-between;
  gap: 20px;

  ${({ placeholder }) =>
    placeholder &&
    css`
      justify-content: center;
      background-color: ${({ theme }) => theme.bg.accent};
      border: 1px solid ${({ theme }) => colord(theme.bg.accent).alpha(0.3).toHex()};

      ${IconWrapper} {
        order: -1;
      }
      ${Title} {
        color: ${({ theme }) => theme.font.secondary};
        margin-top: var(--spacing-2);
        margin-bottom: 0;
      }
      ${Description} {
        margin: var(--spacing-3) 0;
      }
    `}
`

const Title = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: var(--spacing-2);
`

const IconWrapper = styled.div`
  width: 40px;
  flex-shrink: 0;

  svg {
    width: 100%;
  }
`

const Description = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const InfoIcon = styled(Info)`
  margin-right: var(--spacing-1);
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
`
