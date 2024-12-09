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

import { bip39Words } from '@/bip39'

const bip39WordsString = bip39Words.join('|')

export const getHumanReadableError = (error: unknown, defaultErrorMsg: string) => {
  const messageChunks = []

  if (defaultErrorMsg) messageChunks.push(defaultErrorMsg)
  if (errorHasMessageProp(error) && error.message) {
    messageChunks.push(error.message)
  } else if (typeof error?.toString === 'function') {
    messageChunks.push(error.toString().replace('Error: [API Error] - ', ''))
  }

  return messageChunks.join(' - ')
}

export const cleanExceptionMessage = (error: unknown) =>
  getHumanReadableError(error, '').replace(new RegExp(`\\b(${bip39WordsString})\\b`, 'g'), '[...]')

export const errorHasMessageProp = (error: unknown): error is { message: string } =>
  'message' in (error as { message?: string })
