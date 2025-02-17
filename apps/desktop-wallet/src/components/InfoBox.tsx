import { colord } from 'colord'
import { LucideIcon } from 'lucide-react'
import styled, { css, DefaultTheme, useTheme } from 'styled-components'

type InfoBoxImportance = 'default' | 'accent' | 'alert' | 'warning'

export interface InfoBoxProps {
  text?: string
  Icon?: LucideIcon
  label?: string
  importance?: InfoBoxImportance
  ellipsis?: boolean
  wordBreak?: boolean
  onClick?: () => void
  small?: boolean
  short?: boolean
  contrast?: boolean
  className?: string
}

const InfoBox: FC<InfoBoxProps> = ({
  Icon,
  text,
  label,
  importance = 'default',
  className,
  ellipsis,
  wordBreak,
  onClick,
  short,
  children,
  contrast
}) => {
  const theme = useTheme()

  return (
    <div className={className} onClick={onClick}>
      {label && <Label>{label}</Label>}
      <StyledBox importance={importance} short={short} contrast={contrast}>
        {Icon && (
          <IconContainer>
            <Icon color={getImportanceColor(theme, importance)} strokeWidth={1.5} />
          </IconContainer>
        )}
        <TextContainer wordBreak={wordBreak} ellipsis={ellipsis}>
          {text || children}
        </TextContainer>
      </StyledBox>
    </div>
  )
}

const getImportanceColor = (theme: DefaultTheme, importance?: InfoBoxImportance) =>
  importance
    ? {
        default: theme.bg.accent,
        alert: theme.global.alert,
        warning: theme.global.highlight,
        accent: theme.global.accent
      }[importance]
    : theme.global.accent

export default styled(InfoBox)`
  width: 100%;
  margin: 0 auto var(--spacing-4) auto;
  max-width: ${({ small }) => (small ? '300px' : 'initial')};
  line-height: 1.5em;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const TextContainer = styled.div<{ wordBreak?: boolean; ellipsis?: boolean }>`
  flex: 2;
  font-weight: var(--fontWeight-medium);
  word-break: ${({ wordBreak }) => (wordBreak ? 'break-all' : 'initial')};
  text-align: center;

  ${({ ellipsis }) =>
    ellipsis
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
        `
      : css`
          overflow-wrap: anywhere;
        `}
`

const Label = styled.label`
  display: block;
  width: 100%;
  margin-left: var(--spacing-3);
  margin-bottom: 7px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-semiBold);
`

const StyledBox = styled.div<{
  importance?: InfoBoxImportance
  short?: boolean
  contrast?: boolean
}>`
  padding: var(--spacing-3);
  height: ${({ short }) => (short ? 'var(--inputHeight)' : 'auto')};
  background-color: ${({ theme, contrast, importance }) =>
    contrast
      ? theme.bg.secondary
      : importance
        ? colord(getImportanceColor(theme, importance)).alpha(0.05).toHex()
        : theme.bg.primary};

  display: flex;
  border-radius: var(--radius-big);
  align-items: center;
  gap: 15px;
`
