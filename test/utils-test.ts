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

import * as utils from '../dist/lib/utils.js'
import EC from 'elliptic'
import assert from 'assert'

const store = utils.getStorage()

describe('utils', function () {
  it('should store and load locally', () => {
    const obj0 = { theAnswer: 42 }
    store.save('default', obj0)
    const obj1 = store.load('default')
    expect(JSON.stringify(obj0)).toEqual(JSON.stringify(obj1))
    store.remove('default')
  })

  it('should store and list multiple wallets', () => {
    const obj0 = { theAnswer: 42 }
    store.save('one', obj0)
    store.save('two', obj0)
    assert.deepStrictEqual(['one', 'two'], store.list())
  })

  it('should compress signature', () => {
    const vectors = [
      [
        'Satoshi Nakamoto',
        '0000000000000000000000000000000000000000000000000000000000000001',
        '934b1ea10a4b3c1757e2b0c017d0b6143ce3c9a7e6a4a49860d7a6ab210ee3d82442ce9d2b916064108014783e923ec36b49743e2ffa1c4496f01a512aafd9e5'
      ],
      [
        'Everything should be made as simple as possible, but not simpler.',
        '0000000000000000000000000000000000000000000000000000000000000001',
        '33a69cd2065432a30f3d1ce4eb0d59b8ab58c74f27c41a7fdb5696ad4e6108c96f807982866f785d3f6418d24163ddae117b7db4d5fdf0071de069fa54342262'
      ],
      [
        'All those moments will be lost in time, like tears in rain. Time to die...',
        '0000000000000000000000000000000000000000000000000000000000000001',
        '8600dbd41e348fe5c9465ab92d23e3db8b98b873beecd930736488696438cb6b547fe64427496db33bf66019dacbf0039c04199abb0122918601db38a72cfc21'
      ],
      [
        'Satoshi Nakamoto',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
        'fd567d121db66e382991534ada77a6bd3106f0a1098c231e47993447cd6af2d06b39cd0eb1bc8603e159ef5c20a5c8ad685a45b06ce9bebed3f153d10d93bed5'
      ],
      [
        'Alan Turing',
        'f8b8af8ce3c7cca5e300d33939540c10d45ce001b8f252bfbc57ba0342904181',
        '7063ae83e7f62bbb171798131b4a0564b956930092b33b07b395615d9ec7e15c58dfcc1e00a35e1572f366ffe34ba0fc47db1e7189759b9fb233c5b05ab388ea'
      ],
      [
        "There is a computer disease that anybody who works with computers knows about. It's a very serious disease and it interferes completely with the work. The trouble with computers is that you 'play' with them!",
        'e91671c46231f833a6406ccbea0e3e392c76c167bac1cb013f6f1013980455c2',
        'b552edd27580141f3b2a5463048cb7cd3e047b97c9f98076c32dbdf85a68718b279fa72dd19bfae05577e06c7c0c1900c371fcd5893f7e1d56a37d30174671f6'
      ]
    ]

    const ec = new EC.ec('secp256k1')

    vectors.forEach((vector) => {
      const privateKey = vector[1]
      const signatureExpected = vector[2]
      const keyPair = ec.keyFromPrivate(privateKey)

      const message = vector[0]
      const sha256 = ec.hash().update(message).digest()
      const signature = utils.signatureEncode(ec, keyPair.sign(sha256))
      assert.deepStrictEqual(signature, signatureExpected)
    })
  })
})
