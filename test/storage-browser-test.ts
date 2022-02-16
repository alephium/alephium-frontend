/**
 * @jest-environment jsdom
 */
/* eslint-disable header/header */
/*
Copyright 2018 - 2022 The Alephium Authors
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

import 'jest-localstorage-mock'

import BrowserStorage from '../lib/storage-browser'
import * as utils from '../lib/utils'

describe('storage-browser', () => {
  const storage = new BrowserStorage()

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should assign the correct key name', () => {
    expect(storage.key).toBe('wallet')
  })

  it('should save to localStorage', () => {
    const name = 'foo'
    const value = { bar: 'baz' }

    storage.save(name, value)

    expect(window.localStorage.setItem).toHaveBeenLastCalledWith('wallet-foo', '{"bar":"baz"}')
    expect(window.localStorage.__STORE__['wallet-foo']).toBe('{"bar":"baz"}')
    expect(Object.keys(window.localStorage.__STORE__).length).toBe(1)
  })

  it('should load from localStorage', () => {
    const name = 'foo'
    const value = { bar: 'baz' }

    storage.save(name, value)
    const result = storage.load(name)

    expect(window.localStorage.getItem).toHaveBeenLastCalledWith('wallet-foo')
    expect(result).toEqual(value)
  })

  it('should throw an error when key does not exist', () => {
    expect(() => storage.load('unknown-key')).toThrowError('Unable to load wallet unknown-key')
  })

  it('should remove from localStorage', () => {
    const name = 'foo'
    const value = { bar: 'baz' }

    storage.save(name, value)

    expect(window.localStorage.__STORE__['wallet-foo']).toBe('{"bar":"baz"}')

    storage.remove(name)

    expect(window.localStorage.__STORE__['wallet-foo']).toBeUndefined()
    expect(Object.keys(window.localStorage.__STORE__).length).toBe(0)
  })

  it('should list the names of all items from localStorage', () => {
    const name1 = 'foo'
    const value1 = { bar: 'baz' }
    const name2 = 'bar'
    const value2 = { foo: 'bar' }

    storage.save(name1, value1)
    storage.save(name2, value2)

    expect(storage.list()).toEqual([name1, name2])
    expect(Object.keys(window.localStorage.__STORE__).length).toBe(2)
  })
})

describe('utils', () => {
  it('should return a browser storage', () => {
    const storage = utils.getStorage()
    expect(storage).toBeInstanceOf(BrowserStorage)
  })
})
