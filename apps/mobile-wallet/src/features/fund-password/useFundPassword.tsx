import { getFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { useAsyncData } from '~/hooks/useAsyncData'

const useFundPassword = () => {
  const { data: fundPassword } = useAsyncData(getFundPassword)

  return fundPassword
}

export default useFundPassword
