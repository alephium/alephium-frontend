/*
Copyright 2018 - 2023 The Alephium Authors
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tryGetString = (obj: any): string | null => (typeof obj.toString === 'function' ? obj.toString() : null)

export interface APIError {
  error: {
    detail?: string
    message?: string
  }
  status: number
  statusText: string
}

const isHTTPError = (e: unknown): e is APIError => (e as APIError).error !== undefined

export const getHumanReadableError = (e: unknown, defaultErrorMessage: string) => {
  const stringifiedError = tryGetString(e)
  const serverError = isHTTPError(e)
    ? e.error.detail || `(${e.status}${e.statusText && `: ${e.statusText}`}) ${e.error.message || ''}`
    : stringifiedError

  return `${defaultErrorMessage}${serverError && `: ${serverError}`}`
}
