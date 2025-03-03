import styled from 'styled-components'

interface LogoProps {
  image: string
  size: number
}

const Logo = ({ image, size }: LogoProps) => (
  <LogoStyled size={size}>
    <LogoImage src={image} />
  </LogoStyled>
)

export default Logo

const LogoStyled = styled.div<Pick<LogoProps, 'size'>>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex-shrink: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.bg.tertiary};
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`
