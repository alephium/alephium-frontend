/*
Copyright 2018 - 2022 The Alephium Authors
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

import { ALPH, TokenInfo } from '@alephium/token-list'
import { Canvas, Circle, SweepGradient, vec } from '@shopify/react-native-skia'
import { HelpCircle } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import { selectAssetInfoById, selectNFTById } from '~/store/assets/assetsSelectors'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface AssetLogoProps {
  assetId: TokenInfo['id']
  size: number
  style?: StyleProp<ViewStyle>
}

const AssetLogo = ({ assetId, size, style }: AssetLogoProps) => {
  const theme = useTheme()
  const token = useAppSelector((state) => selectAssetInfoById(state, assetId))
  const nft = useAppSelector((s) => selectNFTById(s, assetId))

  const imageUrl = token?.logoURI || nft?.image

  return (
    <AssetLogoStyled {...{ assetId, style, size }} logoURI={imageUrl} isNft={!!nft}>
      {imageUrl ? (
        <LogoImage source={{ uri: imageUrl }} />
      ) : assetId === ALPH.id ? (
        <>
          <AlephiumLogoBackgroundCanvas style={{ height: size, width: size }}>
            <Circle cx={size / 2} cy={size / 2} r={size / 2}>
              <SweepGradient c={vec(size / 2, size / 2)} colors={['#FF4385', '#61A1F6', '#FF7D26', '#FF4385']} />
            </Circle>
          </AlephiumLogoBackgroundCanvas>
          <AlephiumLogo color="white" />
        </>
      ) : token?.name ? (
        <Initials size={size * 0.45}>{token.name.slice(0, 2)}</Initials>
      ) : (
        <HelpCircle size={size * 0.7} color={theme.font.secondary} />
      )}
    </AssetLogoStyled>
  )
}

export default AssetLogo

const AssetLogoStyled = styled.View<AssetLogoProps & { logoURI: TokenInfo['logoURI']; isNft: boolean }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size, isNft }) => (isNft ? BORDER_RADIUS_SMALL : size)}px;
  padding: 1px;
  background: ${({ theme }) => theme.bg.tertiary};

  ${({ assetId, logoURI, size }) =>
    assetId === ALPH.id
      ? css`
          padding: ${size * 0.2}px;
        `
      : !logoURI &&
        css`
          align-items: center;
          justify-content: center;
        `}
`

const LogoImage = styled.Image`
  width: 100%;
  height: 100%;
`

const Initials = styled(AppText)<{ size: number }>`
  text-transform: uppercase;
`

const AlephiumLogoBackgroundCanvas = styled(Canvas)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`
