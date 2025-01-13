export type Language = 'en-US' | 'fr-FR' | 'el-GR' | 'vi-VN' | 'pt-PT' | 'zh-CN' | 'de-DE'

export const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'English', value: 'en-US' },
  // { label: 'Bahasa Indonesia', value: 'id-ID' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Ελληνικά', value: 'el-GR' },
  { label: 'Tiếng Việt', value: 'vi-VN' },
  { label: 'Português', value: 'pt-PT' },
  { label: '简体中文', value: 'zh-CN' }
]
