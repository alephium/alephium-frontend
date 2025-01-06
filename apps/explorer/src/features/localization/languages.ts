export type Language = 'en' | 'fr' | 'id' | 'el' | 'de' | 'vi' | 'zh' | 'it' | 'pt'

export const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'English', value: 'en' },
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Ελληνικά', value: 'el' },
  { label: 'Français', value: 'fr' },
  { label: 'Italiano', value: 'it' },
  { label: 'Português', value: 'pt' },
  { label: 'Tiếng Việt', value: 'vi' },
  { label: '简体中文', value: 'zh' }
]
