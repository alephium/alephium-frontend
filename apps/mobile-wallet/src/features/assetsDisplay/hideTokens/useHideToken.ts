import { hideToken } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { useAppDispatch } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

const useHideToken = (origin: 'quick_actions' | 'app_settings', onHide: () => void) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  return (tokenId: Token['id']) => {
    if (tokenId !== ALPH.id) {
      dispatch(hideToken(tokenId))
      showToast({ text1: t('Asset hidden'), type: 'info' })
      sendAnalytics({ event: 'Hid asset', props: { origin, tokenId } })
    }

    onHide()
  }
}

export default useHideToken
