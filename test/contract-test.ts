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

import { CliqueClient } from '../lib/clique'
import { Signer } from '../lib/signer'
import { Contract, Script, TestContractParams } from '../lib/contract'

describe('contract', function () {
  it('contract', async () => {
    const client = new CliqueClient({ baseUrl: 'http://127.0.0.1:22973' })
    await client.init(false)

    const add = await Contract.from(client, 'add.ral')
    const sub = await Contract.from(client, 'sub.ral')

    const subTestAddress = Contract.randomAddress()
    const subState = sub.toState([0], { alphAmount: 1000000000000000000n }, subTestAddress)
    const testParams: TestContractParams = {
      initialFields: [0],
      testArgs: [subTestAddress, 2, 1],
      existingContracts: [subState]
    }
    const testResult = await add.test(client, 'add', testParams)
    expect(testResult.returns).toEqual([3, 1])
    expect(testResult.contracts[0].fileName).toEqual('sub.ral')
    expect(testResult.contracts[0].fields).toEqual([1])
    expect(testResult.contracts[1].fileName).toEqual('add.ral')
    expect(testResult.contracts[1].fields).toEqual([3])

    const signer = Signer.testSigner(client)

    const subDeployTx = await sub.transactionForDeployment(signer, [0])
    expect(subDeployTx.group).toEqual(3)
    const subSubmitResult = await signer.submitTransaction(subDeployTx.unsignedTx, subDeployTx.txId)
    expect(subSubmitResult.fromGroup).toEqual(3)
    expect(subSubmitResult.toGroup).toEqual(3)
    expect(subSubmitResult.txId).toEqual(subDeployTx.txId)

    const addDeployTx = await add.transactionForDeployment(signer, [0])
    expect(addDeployTx.group).toEqual(3)
    const addSubmitResult = await signer.submitTransaction(addDeployTx.unsignedTx, addDeployTx.txId)
    expect(addSubmitResult.fromGroup).toEqual(3)
    expect(addSubmitResult.toGroup).toEqual(3)
    expect(addSubmitResult.txId).toEqual(addDeployTx.txId)

    const subAddress = subDeployTx.contractAddress
    const addAddress = addDeployTx.contractAddress
    const main = await Script.from(client, 'main.ral', { addAddress: addAddress, subAddress: subAddress })

    const mainScriptTx = await main.transactionForDeployment(signer)
    expect(mainScriptTx.group).toEqual(3)
    const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
    expect(mainSubmitResult.fromGroup).toEqual(3)
    expect(mainSubmitResult.toGroup).toEqual(3)
  })
})
