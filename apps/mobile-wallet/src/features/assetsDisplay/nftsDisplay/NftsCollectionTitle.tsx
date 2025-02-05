import { NFT } from '@alephium/shared'
import { useFetchNftCollection } from '@alephium/shared-react'
import { ActivityIndicator } from 'react-native'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface NftsCollectionTitleProps extends Pick<NFT, 'collectionId'> {
  isFirst?: boolean
}

const NftsCollectionTitle = ({ collectionId, isFirst }: NftsCollectionTitleProps) => {
  const { data: nftCollectionData, isLoading } = useFetchNftCollection(collectionId)

  if (isLoading) return <ActivityIndicator />

  if (!nftCollectionData) return null

  return (
    <NftsCollectionTitleStyled bold size={18} isFirst={isFirst}>
      {nftCollectionData.name}
    </NftsCollectionTitleStyled>
  )
}

export default NftsCollectionTitle

const NftsCollectionTitleStyled = styled(AppText)<{ isFirst?: boolean }>`
  ${({ isFirst }) =>
    !isFirst &&
    css`
      margin-top: ${DEFAULT_MARGIN * 2}px;
    `}

  margin-bottom: ${DEFAULT_MARGIN}px;
`
