import { useAppSelector } from '~/hooks/redux'

export const useIsWalletWatchOnly = () => {
  const walletType = useAppSelector((s) => s.wallet.type)

  return walletType === 'watch-only'
}
