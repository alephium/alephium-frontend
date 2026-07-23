import styled from 'styled-components'

const TextButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <StyledTextButton {...props}>{children}</StyledTextButton>
)

const StyledTextButton = styled.button`
  background: transparent;
  font-size: inherit;
  color: ${({ theme, disabled }) => (disabled ? theme.font.secondary : theme.global.accent)};

  display: flex;
  align-items: center;
  padding: 0;
  border: 0;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  &:hover {
    color: ${({ theme, disabled }) => (disabled ? theme.font.secondary : theme.global.accent)};
  }
`

export default TextButton
