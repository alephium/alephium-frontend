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

import { HelpCircle } from 'lucide-react'
import { memo } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'

import useToken, { isFT, isListedFT, isNFT } from '@/api/apiDataHooks/useToken'
import { TokenId } from '@/types/tokens'

interface AssetLogoProps {
  tokenId: TokenId
  size: number
  className?: string
}

const AssetLogo = memo(({ tokenId, size, className }: AssetLogoProps) => {
  const { data: token } = useToken(tokenId)
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
        <HelpCircle size={size} />
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
  background: ${({ theme }) => theme.bg.tertiary};
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`

const Initials = styled.span<{ size: number }>`
  font-size: ${({ size }) => size * 0.45}px;
  text-transform: uppercase;
`
