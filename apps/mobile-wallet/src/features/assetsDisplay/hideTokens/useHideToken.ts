import { hideToken } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

const useHideToken = (origin: 'quick_actions' | 'app_settings', modalId: ModalInstance['id']) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { dismiss } = useBottomSheetModal()

  return (tokenId: Token['id']) => {
    if (tokenId !== ALPH.id) {
      dispatch(hideToken(tokenId))
      showToast({ text1: t('Asset hidden'), type: 'info' })
      sendAnalytics({ event: 'Hid asset', props: { origin, tokenId } })
    }

    dismiss(modalId)
  }
}

export default useHideToken
