/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { Language, languageOptions } from '~/features/localization/languages'
import { languageChanged } from '~/features/localization/localizationActions'
import { ModalContent, ModalContentProps } from '~/features/modals/ModalContent'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const LanguageSelectModal = ({ onClose, ...props }: ModalContentProps) => {
  const dispatch = useAppDispatch()
  const currentLanguage = useAppSelector((s) => s.settings.language)

  const handleLanguageChange = (language: Language) => {
    dispatch(languageChanged(language))
    onClose && onClose()
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BoxSurface>
          {languageOptions.map((languageOption, index) => (
            <RadioButtonRow
              key={languageOption.label}
              title={languageOption.label}
              onPress={() => handleLanguageChange(languageOption.value)}
              isActive={currentLanguage === languageOption.value}
              isLast={index === languageOptions.length - 1}
            />
          ))}
        </BoxSurface>
      </ScreenSection>
    </ModalContent>
  )
}

export default LanguageSelectModal
