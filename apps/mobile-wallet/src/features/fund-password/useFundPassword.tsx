import { getFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'

const useFundPassword = () => {
  const walletId = useAppSelector((s) => s.wallet.id)
  const { data: fundPassword } = useAsyncData(() => getFundPassword(walletId))

  return fundPassword
}

export default useFundPassword
