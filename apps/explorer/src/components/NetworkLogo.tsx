import { NetworkPreset } from '@alephium/shared'
import styled from 'styled-components'

interface NetworkLogoProps {
  network: NetworkPreset
  size?: number
}

const NetworkLogo = ({ network, size = 21 }: NetworkLogoProps) => (
  <LogoContainer network={network} size={size}>
    {network === 'devnet' ? 'D' : network === 'mainnet' ? 'M' : 'T'}
  </LogoContainer>
)

const LogoContainer = styled.div<NetworkLogoProps>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: 20%;
  background: ${({ network, theme }) => (network === 'mainnet' ? theme.global.highlightGradient : theme.bg.secondary)};
  color: ${({ network, theme }) => (network === 'mainnet' ? 'rgba(255, 255, 255, 0.8)' : theme.font.primary)};
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
`

export default NetworkLogo
