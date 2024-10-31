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

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import gr from '../../../locales/el-GR/translation.json'
import en from '../../../locales/en-US/translation.json'
import fr from '../../../locales/fr-FR/translation.json'
import pt from '../../../locales/pt-PT/translation.json'
import vi from '../../../locales/vi-VN/translation.json'
import zh from '../../../locales/zh-CN/translation.json'

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    'en-US': { translation: en },
    'fr-FR': { translation: fr },
    'el-GR': { translation: gr },
    'vi-VN': { translation: vi },
    'pt-PT': { translation: pt },
    'zh-CN': { translation: zh }
  },
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  }
})

export default i18next
