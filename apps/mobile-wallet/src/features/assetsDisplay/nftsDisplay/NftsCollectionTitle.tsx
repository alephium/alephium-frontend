import { NFT } from '@alephium/shared'
import { useFetchNftCollection } from '@alephium/shared-react'
import { ActivityIndicator } from 'react-native'
import styled, { css } from 'styled-components/native'

import { ScreenSectionTitle } from '~/components/layout/Screen'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface NftsCollectionTitleProps extends Pick<NFT, 'collectionId'> {
  isFirst?: boolean
}

const NftsCollectionTitle = ({ collectionId, isFirst }: NftsCollectionTitleProps) => {
  const { data: nftCollectionData, isLoading } = useFetchNftCollection(collectionId)

  if (isLoading) return <ActivityIndicator />

  if (!nftCollectionData) return null

  return <ScreenSectionTitleStyled isFirst={isFirst}>{nftCollectionData.name}</ScreenSectionTitleStyled>
}

export default NftsCollectionTitle

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)<{ isFirst?: boolean }>`
  ${({ isFirst }) =>
    !isFirst &&
    css`
      margin-top: ${VERTICAL_GAP}px;
    `}
`
