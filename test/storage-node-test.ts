// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import assert from 'assert'
import mock from 'mock-fs'
import fs from 'fs'

import NodeStorage from '../lib/storage-node'

describe('storage-node', () => {
  beforeEach(() => {
    mock({
      [`${process.env.HOME}`]: {}
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('creates the wallets dir if it does not exist', () => {
    const mockedWalletsUrl = process.env.HOME + '/.alephium-wallet-apps'
    expect(fs.existsSync(mockedWalletsUrl)).toBe(false)
    new NodeStorage()
    expect(fs.existsSync(mockedWalletsUrl)).toBe(true)
  })

  it('should store and load locally', () => {
    const store = new NodeStorage()
    const obj0 = { theAnswer: 42 }
    store.save('default', obj0)
    const obj1 = store.load('default')
    expect(JSON.stringify(obj0)).toEqual(JSON.stringify(obj1))
    store.remove('default')
  })

  it('should store and list multiple wallets', () => {
    const store = new NodeStorage()
    const obj0 = { theAnswer: 42 }
    store.save('one', obj0)
    store.save('two', obj0)
    assert.deepStrictEqual(['one', 'two'], store.list())
  })

  it('should throw an error if wallet does not exist', () => {
    const store = new NodeStorage()
    expect(() => store.load('Invalid wallet name')).toThrow('Unable to load wallet Invalid wallet name')
  })

  it('should return an empty list if wallet dir does not exist', () => {
    const store = new NodeStorage()
    store.walletsUrl = './invalid-dir'
    const keys = store.list()
    expect(keys.length).toBe(0)
  })
})
