import 'dayjs/locale/fr'
import 'dayjs/locale/id'
import 'dayjs/locale/el'
import 'dayjs/locale/de'
import 'dayjs/locale/vi'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/it'

import dayjs from 'dayjs'
import i18next from 'i18next'
import { useEffect } from 'react'
import styled from 'styled-components'

import Menu from '@/components/Menu'
import { Language, languageOptions } from '@/features/localization/languages'
import useStateWithLocalStorage from '@/hooks/useStateWithLocalStorage'

interface LanguageSwitchProps {
  className?: string
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ className }) => {
  const [langValue, setLangValue] = useStateWithLocalStorage<Language>('language', 'en')

  useEffect(() => {
    i18next.changeLanguage(langValue)
    dayjs.locale(langValue)
  }, [langValue])

  const items = languageOptions.map((lang) => ({
    text: lang.label,
    onClick: () => setLangValue(lang.value)
  }))

  return (
    <Menu
      aria-label="Language"
      label={languageOptions.find((o) => o.value === langValue)?.label || ''}
      items={items}
      direction="up"
      className={className}
    />
  )
}

export default styled(LanguageSwitch)`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
`
