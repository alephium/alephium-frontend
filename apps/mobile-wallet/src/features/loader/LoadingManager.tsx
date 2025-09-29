import SpinnerModal from '~/features/loader/SpinnerModal'
import { useAppSelector } from '~/hooks/redux'

const LoadingManager = () => {
  const loadingConfig = useAppSelector((state) => state.loader)

  return <SpinnerModal {...loadingConfig} />
}

export default LoadingManager
