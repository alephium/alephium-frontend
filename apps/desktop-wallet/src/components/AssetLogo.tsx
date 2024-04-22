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

import { FungibleToken, NFT } from '@alephium/shared'
import { HelpCircle } from 'lucide-react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'

interface AssetLogoProps {
  assetImageUrl: FungibleToken['logoURI'] | NFT['image']
  size: number
  assetName?: FungibleToken['name']
  isNft?: boolean
  className?: string
}

const AssetLogo = ({ assetImageUrl, size, assetName, className }: AssetLogoProps) => (
  <div className={className}>
    {assetImageUrl?.endsWith('.mp4') ? (
      <ReactPlayer url={assetImageUrl} muted width={size} height={size} />
    ) : assetImageUrl ? (
      <LogoImage src={assetImageUrl} />
    ) : assetName ? (
      <Initials size={size}>{assetName.slice(0, 2)}</Initials>
    ) : (
      <HelpCircle size={size} />
    )}
  </div>
)

export default styled(AssetLogo)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size, isNft }) => (isNft ? 'var(--radius-tiny)' : `${size}px`)};
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
