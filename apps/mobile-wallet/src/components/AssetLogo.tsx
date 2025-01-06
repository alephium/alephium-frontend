import { selectFungibleTokenById, selectNFTById } from '@alephium/shared'
import { TokenInfo } from '@alephium/token-list'
import { Image } from 'expo-image'
import { HelpCircle } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import NFTImage from '~/components/NFTImage'
import { useAppSelector } from '~/hooks/redux'

interface AssetLogoProps {
  assetId: TokenInfo['id']
  size: number
  style?: StyleProp<ViewStyle>
}

const AssetLogo = ({ assetId, size, style }: AssetLogoProps) => {
  const theme = useTheme()
  const token = useAppSelector((state) => selectFungibleTokenById(state, assetId))
  const nft = useAppSelector((s) => selectNFTById(s, assetId))

  return nft?.image ? (
    <NFTImage nftId={assetId} size={size} />
  ) : (
    <AssetLogoStyled {...{ assetId, style, size }} hasLogo={!!token?.logoURI}>
      {token?.logoURI ? (
        <LogoImageContainer>
          <LogoImage source={{ uri: token.logoURI }} transition={500} contentFit="contain" contentPosition="center" />
        </LogoImageContainer>
      ) : token?.name ? (
        <Initials size={size * 0.45}>{token.name.slice(0, 2)}</Initials>
      ) : (
        <HelpCircle size={size * 0.7} color={theme.font.secondary} />
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
