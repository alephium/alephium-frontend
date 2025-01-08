import { useTranslation } from 'react-i18next'

import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import { Language, languageOptions } from '~/features/localization/languages'
import { languageChanged } from '~/features/localization/localizationActions'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const LanguageSelectModal = withModal(({ id }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const currentLanguage = useAppSelector((s) => s.settings.language)

  const handleLanguageChange = (language: Language) => {
    dispatch(languageChanged(language))
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Language')}>
      <Surface>
        {languageOptions.map((languageOption, index) => (
          <RadioButtonRow
            key={languageOption.label}
            title={languageOption.label}
            onPress={() => handleLanguageChange(languageOption.value)}
            isActive={currentLanguage === languageOption.value}
            isLast={index === languageOptions.length - 1}
          />
        ))}
      </Surface>
    </BottomModal>
  )
})

export default LanguageSelectModal
