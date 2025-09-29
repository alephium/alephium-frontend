import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Row from '~/components/Row'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'

const RecoveryPhraseRow = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const openSafePlaceWarningModal = () => dispatch(openModal({ name: 'SafePlaceWarningModal' }))

  return (
    <Row onPress={openSafePlaceWarningModal} title={t('View secret recovery phrase')} titleColor={theme.global.warning}>
      <Ionicons name="key" size={18} color={theme.global.warning} />
    </Row>
  )
}

export default RecoveryPhraseRow
