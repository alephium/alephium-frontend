import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { themeChanged } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const ThemeRow = () => {
  const { t } = useTranslation()
  const currentTheme = useAppSelector((s) => s.settings.theme)
  const dispatch = useAppDispatch()

  const [isThemeSwitchOverlayVisible, setIsThemeSwitchOverlayVisible] = useState(false)

  const toggleTheme = (value: boolean) => {
    setIsThemeSwitchOverlayVisible(true)

    setTimeout(() => {
      dispatch(themeChanged(value ? 'dark' : 'light'))
      setIsThemeSwitchOverlayVisible(false)
    }, 500)
  }

  return (
    <>
      <Row title={t('Use dark theme')} subtitle={t("Try it, it's nice")}>
        <Toggle value={currentTheme === 'dark'} onValueChange={toggleTheme} />
      </Row>
      <ModalWithBackdrop animationType="fade" visible={isThemeSwitchOverlayVisible} color="black" />
    </>
  )
}

export default ThemeRow
