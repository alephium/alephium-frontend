import { isFT, isListedFT, isNFT } from '@alephium/shared/types'
import { useFetchToken } from '@alephium/shared-react'
import { TokenInfo } from '@alephium/token-list'
import Lucide from '@react-native-vector-icons/lucide/static'
import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import NFTImage from '~/components/NFTImage'

interface AssetLogoProps {
  assetId: TokenInfo['id']
  size: number
  style?: StyleProp<ViewStyle>
}

const AssetLogo = ({ assetId, size, style }: AssetLogoProps) => {
  const theme = useTheme()
  const { data: token } = useFetchToken(assetId)
  const [erroredLogoUri, setErroredLogoUri] = useState<string>()

  if (!token) return null

  const logoUri = isListedFT(token) ? token.logoURI : undefined
  // Falling through to the initials keeps a dead or rate-limited image host from rendering as an empty circle.
  const showLogo = !!logoUri && logoUri !== erroredLogoUri

  return isNFT(token) ? (
    <NFTImage nftId={assetId} size={size} />
  ) : (
    <AssetLogoStyled {...{ assetId, style, size }} hasLogo={showLogo}>
      {showLogo ? (
        <LogoImageContainer>
          <LogoImage
            source={{ uri: logoUri }}
            transition={500}
            contentFit="contain"
            contentPosition="center"
            onError={() => setErroredLogoUri(logoUri)}
          />
        </LogoImageContainer>
      ) : isFT(token) ? (
        <Initials size={size * 0.45}>{token.name.slice(0, 2)}</Initials>
      ) : (
        <Lucide name="help-circle" size={size * 0.7} color={theme.font.secondary} />
      )}
    </AssetLogoStyled>
  )
}

export default AssetLogo

const AssetLogoStyled = styled.View<AssetLogoProps & { hasLogo: boolean }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  background: ${({ theme }) => theme.bg.tertiary};
  overflow: hidden;

  ${({ hasLogo }) =>
    !hasLogo &&
    css`
      align-items: center;
      justify-content: center;
    `}
`

const LogoImageContainer = styled.View`
  height: 100%;
  width: 100%;
`

const LogoImage = styled(Image)`
  flex: 1;
`

const Initials = styled(AppText)<{ size: number }>`
  text-transform: uppercase;
`
