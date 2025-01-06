import { calcTxAmountsDeltaForAddress } from '../src/transactions'
import transactions from './fixtures/transactions.json'

it('should calucate the amount delta between the inputs and outputs of an address in a transaction', () => {
  expect(
    calcTxAmountsDeltaForAddress(transactions.oneInputOneOutput, transactions.oneInputOneOutput.inputs[0].address)
      .alphAmount
  ).toEqual(BigInt('-50000000000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.twoInputsOneOutput, transactions.twoInputsOneOutput.inputs[0].address)
        .alphAmount
    ).toEqual(BigInt('-150000000000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.twoInputsZeroOutput, transactions.twoInputsZeroOutput.inputs[0].address)
        .alphAmount
    ).toEqual(BigInt('-200000000000000000000')),
    expect(() =>
      calcTxAmountsDeltaForAddress(transactions.missingInputs, transactions.missingInputs.outputs[0].address)
    ).toThrowError('Missing transaction details'),
    expect(() =>
      calcTxAmountsDeltaForAddress(transactions.missingOutputs, transactions.missingOutputs.inputs[0].address)
    ).toThrowError('Missing transaction details')
})
