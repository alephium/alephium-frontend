import { isFT, isListedFT, isNFT, TokenId } from '@alephium/shared/types'
import { useFetchToken } from '@alephium/shared-react'
import { useCachedTokenLogo } from '@alephium/shared-react/images'
import { HelpCircle } from 'lucide-react'
import { memo, useState } from 'react'
import styled from 'styled-components'

interface AssetLogoProps {
  tokenId: TokenId
  size: number
  className?: string
}

const AssetLogo = memo(({ tokenId, size, className }: AssetLogoProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token) return null

  return (
    <AssetLogoStyled className={className} size={size} isSquare={isNFT(token)}>
      <AssetLogoContent
        size={size}
        listedFtLogoUri={isListedFT(token) ? token.logoURI : undefined}
        nftImage={isNFT(token) ? token.image : undefined}
        name={isFT(token) || isNFT(token) ? token.name : undefined}
      />
    </AssetLogoStyled>
  )
})

export default AssetLogo

interface AssetLogoContentProps {
  size: number
  listedFtLogoUri?: string
  nftImage?: string
  name?: string
}

const AssetLogoContent = ({ size, listedFtLogoUri, nftImage, name }: AssetLogoContentProps) => {
  const { src: cachedLogoSrc, isLoading } = useCachedTokenLogo(listedFtLogoUri)
  const [erroredSrc, setErroredSrc] = useState<string>()

  if (nftImage?.endsWith('.mp4'))
    return <LogoVideo src={nftImage} autoPlay muted loop playsInline width={size} height={size} />

  const src = listedFtLogoUri ? cachedLogoSrc : nftImage

  if (isLoading) return null

  // Falling through to the initials keeps a dead or rate-limited image host from rendering as a broken image.
  if (src && src !== erroredSrc) return <LogoImage src={src} onError={() => setErroredSrc(src)} />

  if (name) return <Initials size={size}>{name.slice(0, 2)}</Initials>

  return <HelpCircle size={size - 5} strokeWidth={1.5} />
}

const AssetLogoStyled = styled.div<Pick<AssetLogoProps, 'size'> & { isSquare: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size, isSquare }) => (isSquare ? 'var(--radius-tiny)' : `${size}px`)};
  flex-shrink: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.bg.primary};
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`

const LogoVideo = styled.video`
  object-fit: cover;
`

const Initials = styled.span<{ size: number }>`
  font-size: ${({ size }) => size * 0.45}px;
  text-transform: uppercase;
`
