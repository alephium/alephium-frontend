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
  { label: '简体中文', value: 'zh-CN' }
]
