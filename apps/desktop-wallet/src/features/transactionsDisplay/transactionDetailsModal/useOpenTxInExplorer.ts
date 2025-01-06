import { explorer as e } from '@alephium/web3'

import { useAppSelector } from '@/hooks/redux'
import { openInWebBrowser } from '@/utils/misc'

const useOpenTxInExplorer = (txHash: e.Transaction['hash']) => {
  const explorerUrl = useAppSelector((state) => state.network.settings.explorerUrl)

  return () => openInWebBrowser(`${explorerUrl}/transactions/${txHash}`)
}

export default useOpenTxInExplorer
