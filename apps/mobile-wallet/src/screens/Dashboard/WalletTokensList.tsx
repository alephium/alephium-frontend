import { useFetchWalletFtsSorted, useFetchWalletSingleTokenBalances } from '@alephium/shared-react'
import { View } from 'react-native'
import styled from 'styled-components/native'

import EmptyTokensListPlaceholders from '~/components/tokensLists/EmptyTokensListPlaceholder'
import FtBalance from '~/components/tokensLists/FtBalance'
import FtListItem, { FtListItemProps } from '~/components/tokensLists/FtListItem'
import FtWorth from '~/components/tokensLists/FtWorth'
import WalletTokensListFooter from '~/screens/Dashboard/WalletTokensListFooter'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'

// TODO: Should be converted to a flash list like the token list in the address details modal
const WalletTokensList = () => {
  const { data: sortedFts, isLoading } = useFetchWalletFtsSorted()

  const hasFts = sortedFts.length > 0

  if (isLoading || !hasFts) return <EmptyTokensListPlaceholders isLoading={isLoading} isEmpty={!hasFts} />

  return (
    <WalletTokensListStyled>
      {sortedFts.map(({ id }, index) => (
        <WalletFtListItem key={id} tokenId={id} hideSeparator={index === sortedFts.length - 1} />
      ))}

      <WalletTokensListFooter />
    </WalletTokensListStyled>
  )
}

export default WalletTokensList

const WalletFtListItem = (props: FtListItemProps) => {
  const { tokenId } = props
  const { data: tokenBalances } = useFetchWalletSingleTokenBalances({ tokenId })

  const balance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <FtListItem
      rightSideContent={
        <View>
          <FtBalance tokenId={tokenId} balance={balance} />
          <FtWorth tokenId={tokenId} amount={balance} color="secondary" />
        </View>
      }
      {...props}
    />
  )
}

const WalletTokensListStyled = styled.View`
  padding: 10px 0;
  border-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
  position: relative;
`
