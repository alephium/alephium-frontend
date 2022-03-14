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

import { CliqueClient, Contract, Script, Signer, TestContractParams } from 'alephium-js'

async function greet() {
  const client = new CliqueClient({ baseUrl: 'http://127.0.0.1:22973' })
  await client.init(false)

  const greeter = await Contract.from(client, 'greeter.ral')

  const testParams: TestContractParams = {
    initialFields: [1]
  }
  const testResult = await greeter.test(client, 'greet', testParams)
  console.log(testResult)

  const signer = Signer.testSigner(client)

  const deployTx = await greeter.transactionForDeployment(signer, [1])
  console.log(deployTx.group)
  const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
  console.log(submitResult)

  const greeterAddress = deployTx.contractAddress
  const main = await Script.from(client, 'greeter-main.ral', { greeterAddress: greeterAddress })

  const mainScriptTx = await main.transactionForDeployment(signer)
  console.log(mainScriptTx.group)
  const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
  console.log(mainSubmitResult)
}

greet()
