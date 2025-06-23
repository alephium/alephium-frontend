import { usePotentialModalId } from '~/features/modals/ModalContext'
import { selectIsTopModal } from '~/features/modals/modalSelectors'
import { useAppSelector } from '~/hooks/redux'

const useIsTopModal = () => {
  const modalId = usePotentialModalId()

  return useAppSelector((state) => !!modalId && selectIsTopModal(state, modalId))
}

export default useIsTopModal
