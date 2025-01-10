import { SelectOption } from '@/components/Inputs/Select'

export type Language =
  | 'en-US'
  | 'fr-FR'
  | 'de-DE'
  | 'vi-VN'
  | 'pt-PT'
  | 'ru-RU'
  | 'bg-BG'
  | 'es-ES'
  | 'id-ID'
  | 'tr-TR'
  | 'it-IT'
  | 'el-GR'
  | 'zh-CN'
  | 'th-TH'

export const languageOptions: SelectOption<Language>[] = [
  { label: 'English', value: 'en-US' },
  { label: 'Bahasa Indonesia', value: 'id-ID' },
  { label: 'Български', value: 'bg-BG' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Español', value: 'es-ES' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Italiano', value: 'it-IT' },
  { label: 'Português', value: 'pt-PT' },
  { label: 'Русский', value: 'ru-RU' },
  { label: 'Türkçe', value: 'tr-TR' },
  { label: 'Tiếng Việt', value: 'vi-VN' },
  { label: 'Ελληνικά', value: 'el-GR' },
  { label: 'ไทย', value: 'th-TH' },
  { label: '简体中文', value: 'zh-CN' }
]
