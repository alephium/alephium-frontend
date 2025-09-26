import AppText from '~/components/AppText'
import Row from '~/components/Row'
import { languageOptions } from '~/features/localization/languages'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const LanguageRow = () => {
  const language = useAppSelector((s) => s.settings.language)
  const dispatch = useAppDispatch()

  const openLanguageSelectModal = () => dispatch(openModal({ name: 'LanguageSelectModal' }))

  return (
    <Row onPress={openLanguageSelectModal} title="Language">
      <AppText bold>{languageOptions.find((l) => l.value === language)?.label}</AppText>
    </Row>
  )
}

export default LanguageRow
