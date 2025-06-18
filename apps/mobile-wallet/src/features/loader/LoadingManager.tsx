import SpinnerModal from '~/features/loader/SpinnerModal'
import { useAppSelector } from '~/hooks/redux'

const LoadingManager = () => {
  const loadingConfig = useAppSelector((state) => state.loader)

  return <SpinnerModal isActive={!!loadingConfig.text} {...loadingConfig} />
}

export default LoadingManager
