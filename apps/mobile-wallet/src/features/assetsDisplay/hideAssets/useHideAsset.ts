import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { hideAsset } from '~/features/assetsDisplay/hideAssets/hiddenAssetsActions'
import { closeModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

const useHideAsset = (origin: 'quick_actions' | 'app_settings', modalId?: number) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  return (tokenId: Token['id']) => {
    if (tokenId !== ALPH.id) {
      dispatch(hideAsset(tokenId))
      showToast({ text1: t('Asset hidden'), type: 'info' })
      sendAnalytics({ event: 'Hid asset', props: { origin, tokenId } })
    }

    modalId && dispatch(closeModal({ id: modalId }))
  }
}

export default useHideAsset
