import { useFetchWalletTokensByType } from '@alephium/shared-react'
import styled from 'styled-components/native'

import HiddenTokensButton from '~/components/tokensLists/HiddenTokensButton'
import UnknownTokensButton from '~/components/tokensLists/UnknownTokensButton'
import { useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

const WalletTokensListFooter = () => (
  <WalletTokensListFooterStyled>
    <WalletHiddenTokensButton />
    <WalletUknownTokensButton />
  </WalletTokensListFooterStyled>
)

export default WalletTokensListFooter

const WalletHiddenTokensButton = () => {
  const tokensCount = useAppSelector((s) => s.hiddenAssets.hiddenAssetsIds.length)

  return <HiddenTokensButton tokensCount={tokensCount} />
}

const WalletUknownTokensButton = () => {
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeHidden: false })

  if (!nstIds?.length) return null

  return <UnknownTokensButton tokensCount={nstIds.length} />
}

const WalletTokensListFooterStyled = styled.View`
  margin-bottom: ${VERTICAL_GAP}px;
`
