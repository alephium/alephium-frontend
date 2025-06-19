import { memo } from 'react'

import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import { Language, languageOptions } from '~/features/localization/languages'
import { languageChanged } from '~/features/localization/localizationActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const LanguageSelectModal = memo(() => {
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()

  const currentLanguage = useAppSelector((s) => s.settings.language)

  const handleLanguageChange = (language: Language) => {
    dispatch(languageChanged(language))
    dismissModal()
  }

  return (
    <BottomModal2 title="Language">
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
    </BottomModal2>
  )
})

export default LanguageSelectModal
