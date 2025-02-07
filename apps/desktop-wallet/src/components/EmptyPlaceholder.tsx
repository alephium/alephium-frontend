import styled from 'styled-components'

interface EmptyPlaceholderProps {
  children: string
  emoji?: string
  className?: string
}

const EmptyPlaceholder = ({ children, emoji, className }: EmptyPlaceholderProps) => (
  <EmptyPlaceholderStyled className={className}>
    {emoji && <Emoji>{emoji}</Emoji>}
    <Text>{children}</Text>
  </EmptyPlaceholderStyled>
)

export default EmptyPlaceholder

const EmptyPlaceholderStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
`

const Emoji = styled.div`
  font-size: 30px;
`

const Text = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`
