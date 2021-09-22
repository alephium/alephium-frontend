// Copyright 2018 The Alephium Authors
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

import * as clique from "../dist/lib/clique"

import EC from 'elliptic'
import assert from 'assert'

describe('clique', function () {
  it("should verify signature", () =>{
    const txHash = "8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2"
    const pubKey = "02625b26ae1c5f7986475009e4037b3e6fe6320fde3c3f3332bea11ecadc35dd13"
    const txSig = "78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc"
    const unnormalizedSig = "78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9cbd24040b318c14973a1f299edd14da2bcecd0d48775953ec71582fb97254ff85"
    const wrongSig = "88471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc"

    const client = new clique.CliqueClient()
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, txSig), true)
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, unnormalizedSig), false)
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, wrongSig), false)
  })

  it("should sign and verify signature", () =>{
    const ec = new EC.ec('secp256k1')
    const key = ec.genKeyPair()
    const privateKey = key.getPrivate().toString('hex')
    const publicKey = key.getPublic().encode('hex', true)

    const client = new clique.CliqueClient()
    const txHash = "8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2"
    const signature = client.transactionSign(txHash, privateKey)
    assert.strictEqual(client.transactionVerifySignature(txHash, publicKey, signature), true)
  })
})
