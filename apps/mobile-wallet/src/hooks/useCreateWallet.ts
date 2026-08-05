import { AnalyticsEvent } from '@alephium/shared'
import { newWalletInitialAddressGenerated } from '@alephium/shared/store'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useCallback } from 'react'

import { sendAnalytics } from '~/analytics'
import { useAppDispatch } from '~/hooks/redux'
import {
  generateAndStoreWallet,
  getDefaultWalletName,
  getWalletOrdinal,
  storeIsGettingStartedActive
} from '~/persistent-storage/wallet'
import { createWalletListEntry } from '~/persistent-storage/walletList'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { walletAddedToList } from '~/store/wallet/walletsSlice'
import { GeneratedWallet } from '~/types/wallet'
import { getInitialAddressSettings } from '~/utils/addresses'
import { sleep } from '~/utils/misc'

const useCreateWallet = () => {
  const dispatch = useAppDispatch()
  const { clearQueryCache, restoreQueryCache } = usePersistQueryClientContext()

  return useCallback(async (): Promise<GeneratedWallet> => {
    // Key generation blocks the JS thread, so yield first to let the calling screen paint.
    await sleep(0)

    const name = getDefaultWalletName('create')
    const wallet = await generateAndStoreWallet(name)

    clearQueryCache()
    await restoreQueryCache(wallet.id)

    dispatch(newWalletInitialAddressGenerated({ ...wallet.initialAddress, ...getInitialAddressSettings() }))
    dispatch(newWalletGenerated(wallet))
    dispatch(walletAddedToList(createWalletListEntry(wallet.id, name, 'seed')))

    storeIsGettingStartedActive(wallet.id, true)
    sendAnalytics({ event: AnalyticsEvent.WALLET_CREATED, props: { wallet_ordinal: getWalletOrdinal(wallet.id) } })

    return wallet
  }, [clearQueryCache, dispatch, restoreQueryCache])
}

export default useCreateWallet
