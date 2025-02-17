import { HelpCircle } from 'lucide-react'
import { memo } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'

import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import { isFT, isListedFT, isNFT, TokenId } from '@/types/tokens'

interface AssetLogoProps {
  tokenId: TokenId
  size: number
  className?: string
}

const AssetLogo = memo(({ tokenId, size, className }: AssetLogoProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token) return null

  const image = isListedFT(token) ? token.logoURI : isNFT(token) ? token.image : undefined
  const name = isFT(token) || isNFT(token) ? token.name : undefined

  return (
    <AssetLogoStyled className={className} size={size} isSquare={isNFT(token)}>
      {image?.endsWith('.mp4') ? (
        <ReactPlayer url={image} muted width={size} height={size} />
      ) : image ? (
        <LogoImage src={image} />
      ) : name ? (
        <Initials size={size}>{name.slice(0, 2)}</Initials>
      ) : (
        <HelpCircle size={size - 5} strokeWidth={1.5} />
      )}
    </AssetLogoStyled>
  )
})

export default AssetLogo

const AssetLogoStyled = styled.div<Pick<AssetLogoProps, 'size'> & { isSquare: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size, isSquare }) => (isSquare ? 'var(--radius-tiny)' : `${size}px`)};
  flex-shrink: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.bg.highlight};
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`

const Initials = styled.span<{ size: number }>`
  font-size: ${({ size }) => size * 0.45}px;
  text-transform: uppercase;
`
