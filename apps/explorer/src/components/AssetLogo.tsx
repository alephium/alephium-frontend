import { useCachedTokenLogo } from '@alephium/shared-react/images'
import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RiCopperCoinLine, RiQuestionLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

import { queries } from '@/api'
import { useAssetMetadata } from '@/api/assets/assetsHooks'
import NFTThumbnail from '@/components/NFTThumbnail'
import AlephiumLogo from '@/images/alephium_logo_monochrome.svg?react'
import { NFTMetadataWithFile } from '@/types/assets'

interface AssetLogoProps {
  assetId: string
  size: number
  showTooltip?: boolean
  className?: string
}

// TODO: Use type assertion from tanstack work in DW
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNFTMetadataWithFile = (metadata: any): metadata is NFTMetadataWithFile => 'file' in metadata

const AssetLogo = (props: AssetLogoProps) => {
  const { assetId, showTooltip, className } = props

  const theme = useTheme()
  const metadata = useAssetMetadata(assetId)
  const nftImageSrc = isNFTMetadataWithFile(metadata) ? metadata.file.image : undefined

  const assetType = metadata.type

  const { data: dataType } = useQuery({
    ...queries.assets.NFTsData.type(nftImageSrc || ''),
    enabled: assetType === 'non-fungible' && !!nftImageSrc
  })

  return (
    <AssetLogoStyled className={className} {...props}>
      {assetId === ALPH.id ? (
        <FramedImage borderRadius="full" isAlph />
      ) : assetType === 'fungible' ? (
        <FungibleTokenLogo logoURI={metadata.verified ? metadata.logoURI : undefined} name={metadata.name} />
      ) : assetType === 'non-fungible' ? (
        <NFTThumbnail src={nftImageSrc} size={props.size} border borderRadius={3} />
      ) : (
        <RiQuestionLine color={theme.font.secondary} size="72%" />
      )}
      {!showTooltip ? null : assetType === 'non-fungible' && dataType && ['video', 'image'].includes(dataType) ? (
        <ImageTooltipHolder
          data-tooltip-id="default"
          data-tooltip-html={renderToStaticMarkup(
            <NFTTooltipContainer>
              {dataType === 'video' ? (
                <video src={nftImageSrc} autoPlay loop width="150px" height="150px" />
              ) : (
                <NFTTooltipImage height={150} width={150} src={metadata.file?.image} />
              )}
              <NFTTitle>{metadata.file?.name}</NFTTitle>
            </NFTTooltipContainer>
          )}
        />
      ) : (
        <TooltipHolder
          data-tooltip-id="default"
          data-tooltip-content={assetType === 'fungible' ? (metadata.name ? metadata.name : metadata.id) : metadata.id}
        />
      )}
    </AssetLogoStyled>
  )
}

interface FungibleTokenLogoProps {
  logoURI?: string
  name?: string
}

const FungibleTokenLogo = ({ logoURI, name }: FungibleTokenLogoProps) => {
  const theme = useTheme()
  const { src, isLoading } = useCachedTokenLogo(logoURI)
  const [erroredSrc, setErroredSrc] = useState<string>()

  if (isLoading) return <ImageFrame style={{ borderRadius: '100%' }} />

  // Falling through to the initials keeps a dead or rate-limited image host from rendering as a broken image.
  if (src && src !== erroredSrc)
    return (
      <ImageFrame style={{ borderRadius: '100%', padding: 3 }}>
        <LogoImage src={src} onError={() => setErroredSrc(src)} />
      </ImageFrame>
    )

  if (name) return <TokenInitials>{name.substring(0, 2)}</TokenInitials>

  return <RiCopperCoinLine color={theme.font.secondary} size="72%" />
}

const FramedImage = ({
  src,
  borderRadius,
  isAlph,
  withBorder
}: {
  src?: string
  borderRadius: 'small' | 'full'
  isAlph?: boolean
  withBorder?: boolean
}) => {
  const theme = useTheme()

  return (
    <ImageFrame
      style={{
        borderRadius: borderRadius === 'small' ? 4 : '100%',
        padding: borderRadius === 'small' ? 0 : 3,
        boxShadow: withBorder ? `0 0 0 1px ${theme.border.primary}` : 'initial'
      }}
      isAlph={isAlph}
    >
      {isAlph ? <AlephiumLogo /> : <Image style={{ backgroundImage: `url(${src})` }} />}
    </ImageFrame>
  )
}

export default AssetLogo

const AssetLogoStyled = styled.div<AssetLogoProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  flex-shrink: 0;
`

const Image = styled.div`
  background-size: cover;
  background-position: center;
  height: 100%;
  width: 100%;
`

// The frame insets the logo by its padding, so the frame's own rounding never reaches the artwork's corners.
const LogoImage = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 100%;
`

const ImageFrame = styled.div<{ isAlph?: boolean }>`
  overflow: hidden;
  display: flex;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.bg.tertiary};

  ${({ isAlph }) =>
    isAlph &&
    css`
      background: linear-gradient(218.53deg, #0026ff 9.58%, #f840a5 86.74%);
    `};
`

const TokenInitials = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const ImageTooltipHolder = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

const TooltipHolder = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

const NFTTooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const NFTTooltipImage = styled.img`
  object-fit: contain;
  background-color: black;
`

const NFTTitle = styled.h3`
  text-align: center;
  color: white;
  margin: 5px;
`
