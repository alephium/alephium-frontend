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

import { bip39Words as bip39WordsString } from '@/utils/bip39'

const bip39Words = bip39WordsString.replaceAll(' ', '|')

export const getHumanReadableError = (error: unknown, defaultErrorMsg: string) =>
  typeof error?.toString === 'function' ? error.toString().replace('Error: [API Error] - ', '') : defaultErrorMsg

export const cleanExceptionMessage = (error: unknown) => {
  let exceptionMessage = getHumanReadableError(error, '')
  const bip39Regex = new RegExp(`\\b(${bip39Words})\\b`, 'gi')
  exceptionMessage = exceptionMessage.replace(bip39Regex, '[...]')
  return exceptionMessage
}
