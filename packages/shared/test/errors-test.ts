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

import { cleanExceptionMessage } from '@/errors'

describe('cleanExceptionMessage', () => {
  it('Replaces bip39 words with [...]', () => {
    expect(cleanExceptionMessage(new Error('This is an error containing abandon and ability'))).toBe(
      'Error: This is an [...] containing [...] and [...]'
    )
  })

  it('Returns the same message if no bip39 words are found', () => {
    expect(cleanExceptionMessage(new Error('Here is a string with no sensitive words'))).toBe(
      'Error: Here is a string with no sensitive words'
    )
  })

  it('Handles empty error message', () => {
    expect(cleanExceptionMessage(new Error(''))).toBe('Error')
  })

  it('Handles non-string errors', () => {
    expect(cleanExceptionMessage(new Error('Here is a cleaned up error object'))).toBe(
      'Error: Here is a cleaned up [...] [...]'
    )
  })

  it('Replaces words in a full 24-word mnemonic', () => {
    expect(
      cleanExceptionMessage(
        new Error(
          'pumpkin price lake liar into school cotton town trial kangaroo wrist trend work slab candy napkin today scene fun answer also bid garage lottery'
        )
      )
    ).toBe(
      'Error: [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...]'
    )
  })

  it('Replaces multiple occurrences of the same word', () => {
    expect(cleanExceptionMessage(new Error('Here is a string containing abandon, abandon, and abandon'))).toBe(
      'Error: Here is a string containing [...], [...], and [...]'
    )
  })
})
