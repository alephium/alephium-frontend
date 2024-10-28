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

export type RegionLocales =
  | 'en-US'
  | 'de-CH'
  | 'de-DE'
  | 'es-ES'
  | 'fr-FR'
  | 'el-GR'
  | 'id-ID'
  | 'it-IT'
  | 'pt-PT'
  | 'ru-RU'
  | 'tr-TR'
  | 'vi-VN'

export const regionsOptions: SelectOption<RegionLocales>[] = [
  { label: 'US', value: 'en-US' },
  { label: 'CH', value: 'de-CH' },
  { label: 'DE', value: 'de-DE' },
  { label: 'ES', value: 'es-ES' },
  { label: 'FR', value: 'fr-FR' },
  { label: 'GR', value: 'el-GR' },
  { label: 'ID', value: 'id-ID' },
  { label: 'IT', value: 'it-IT' },
  { label: 'PT', value: 'pt-PT' },
  { label: 'RU', value: 'ru-RU' },
  { label: 'TR', value: 'tr-TR' },
  { label: 'VM', value: 'vi-VN' }
]
