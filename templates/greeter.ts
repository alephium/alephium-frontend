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
