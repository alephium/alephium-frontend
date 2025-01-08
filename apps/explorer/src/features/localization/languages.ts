export type Language = 'en' | 'fr' | 'id' | 'el' | 'de' | 'vi' | 'zh' | 'it' | 'pt' | 'th'

export const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'English', value: 'en' },
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Ελληνικά', value: 'el' },
  { label: 'Français', value: 'fr' },
  { label: 'Italiano', value: 'it' },
  { label: 'Português', value: 'pt' },
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'ไทย', value: 'th' },
  { label: '简体中文', value: 'zh' }
]
