import SpinnerModal from '~/features/loader/SpinnerModal'
import { useAppSelector } from '~/hooks/redux'

const LoadingManager = () => {
  const loadingText = useAppSelector((state) => state.loader.loadingText)

  return <SpinnerModal isActive={!!loadingText} text={loadingText} />
}

export default LoadingManager
