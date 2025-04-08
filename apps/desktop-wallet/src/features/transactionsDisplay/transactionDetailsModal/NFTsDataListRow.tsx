import { NFT } from '@alephium/shared'
import { useFetchTransactionTokens } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import DataList from '@/components/DataList'
import { openModal } from '@/features/modals/modalActions'
import NFTThumbnail from '@/features/thumbnails/NFTThumbnail'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import { useAppDispatch } from '@/hooks/redux'

const NFTsDataListRow = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { nfts }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (nfts.length === 0) return null

  const openNFTDetailsModal = (nftId: NFT['id']) => dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId } }))

  return (
    <DataList.Row label={t('NFTs')}>
      <NFTThumbnails columns={nfts.length > 3 ? 3 : nfts.length}>
        {nfts.map((nft) => (
          <NFTThumbnail nftId={nft.id} key={nft.id} onClick={() => openNFTDetailsModal(nft.id)} autoPlay />
        ))}
      </NFTThumbnails>
    </DataList.Row>
  )
}

export default NFTsDataListRow

const NFTThumbnails = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  grid-auto-flow: initial;
  gap: 10px;
`
