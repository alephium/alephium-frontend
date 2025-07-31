import { findNextAvailableAddressIndex } from '../src/utils/addresses'

it('Should find the next available address index', () => {
  expect(findNextAvailableAddressIndex()).toEqual(0)
  expect(findNextAvailableAddressIndex(0, [0])).toEqual(1)
  expect(findNextAvailableAddressIndex(0, [0, 1])).toEqual(2)
  expect(findNextAvailableAddressIndex(0, [0, 1, 2])).toEqual(3)
  expect(findNextAvailableAddressIndex(0, [1, 2, 3])).toEqual(4)
  expect(findNextAvailableAddressIndex(0, [2])).toEqual(1)
  expect(findNextAvailableAddressIndex(1, [2])).toEqual(3)
  expect(findNextAvailableAddressIndex(2, [2])).toEqual(3)
  expect(findNextAvailableAddressIndex(2, [1])).toEqual(3)
  expect(findNextAvailableAddressIndex(2, [])).toEqual(3)
  expect(() => findNextAvailableAddressIndex(-1, [])).toThrow()
})
