export type Language = 'en-US' | 'fr-FR' | 'el-GR' | 'vi-VN' | 'pt-PT' | 'zh-CN'

export const languageOptions: { label: string; value: Language }[] = [
  { label: 'English', value: 'en-US' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Ελληνικά', value: 'el-GR' },
  { label: 'Tiếng Việt', value: 'vi-VN' },
  { label: 'Português', value: 'pt-PT' },
  { label: '简体中文', value: 'zh-CN' }
]
