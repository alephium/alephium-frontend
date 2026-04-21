import { useFetchWalletNfts } from '@alephium/shared-react'
import styled from 'styled-components/native'

import NftsGridFlashList from '~/features/assetsDisplay/nftsDisplay/NftsGridFlashList'

const WalletNftsList = () => {
  const { data: nfts, isLoading } = useFetchWalletNfts()

  return (
    <WalletNftsListStyled>
      <NftsGridFlashList nfts={nfts} isLoading={isLoading} contentContainerPaddingHorizontal={0} />
    </WalletNftsListStyled>
  )
}

export default WalletNftsList

const WalletNftsListStyled = styled.View`
  min-height: 200px;
  width: 100%;
  padding: 20px 0;
`
