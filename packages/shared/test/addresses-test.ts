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

import { isAddressValid } from '@/utils/addresses'

describe('addresses', () => {
  it('is valid', async () => {
    expect(isAddressValid('16sR3EMn2BdFgENRhz6N2TJ78nfaADdv3prKXUQMaB6m3')).toBeTruthy()
    expect(isAddressValid('19XWyoWy6DjrRp7erWqPfBnh7HL1Sb2Ub8SVjux2d71Eb')).toBeTruthy()
    expect(isAddressValid('1CsutTzw8WVhqr1PB6F1tYinuLihAsAm9FxE7rVkC3Z2u')).toBeTruthy()
    expect(isAddressValid('1CwD52BrUj9e4WDJSZ7RXLU2A8us4ZFSmYBDKu98p7szi')).toBeTruthy()
    expect(isAddressValid('1BHSQ8JMeYHZe2kj3KmLjuQCSM3mvzYjNutz14uRPbxZM')).toBeTruthy()
    expect(isAddressValid('')).toBeFalsy()
    expect(isAddressValid('123')).toBeFalsy()
  })
})
