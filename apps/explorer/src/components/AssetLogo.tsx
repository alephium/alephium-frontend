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

import { ALPH } from '@alephium/token-list'
import { renderToStaticMarkup } from 'react-dom/server'
import { RiCopperCoinLine, RiQuestionLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

import { useAssetMetadata } from '@/api/assets/assetsHooks'
import AlephiumLogoSVG from '@/images/alephium_logo_monochrome.svg'

interface AssetLogoProps {
  assetId: string
  size: number
  showTooltip?: boolean
  className?: string
}

const AssetLogo = (props: AssetLogoProps) => {
  const { assetId, showTooltip, className } = props

  const theme = useTheme()
  const metadata = useAssetMetadata(assetId)

  const assetType = metadata.type

  return (
    <AssetLogoStyled className={className} {...props}>
      {assetId === ALPH.id ? (
        <FramedImage src={AlephiumLogoSVG} borderRadius="full" isAlph />
      ) : assetType === 'fungible' ? (
        metadata.verified ? (
          <FramedImage src={metadata.logoURI} borderRadius="full" />
        ) : metadata.name ? (
          <TokenInitials>{metadata.name.substring(0, 2)}</TokenInitials>
        ) : (
          <RiCopperCoinLine color={theme.font.secondary} size="72%" />
        )
      ) : assetType === 'non-fungible' ? (
        <FramedImage src={metadata.file?.image} borderRadius="small" withBorder />
      ) : (
        <RiQuestionLine color={theme.font.secondary} size="72%" />
      )}
      {!showTooltip ? null : assetType === 'non-fungible' ? (
        <ImageTooltipHolder
          data-tooltip-id="default"
          data-tooltip-html={renderToStaticMarkup(
            <NFTTooltipContainer>
              <NFTTooltipImage height={150} width={150} src={metadata.file?.image} />
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
      <Image style={{ backgroundImage: `url(${src})` }} />
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
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: 100%;
`

const Image = styled.div`
  background-size: cover;
  background-position: center;
  height: 100%;
  width: 100%;
`

const ImageFrame = styled.div<{ isAlph?: boolean }>`
  overflow: hidden;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.bg.tertiary};

  ${({ isAlph }) =>
    isAlph &&
    css`
      background: linear-gradient(218.53deg, #0075ff 9.58%, #d340f8 86.74%);
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
