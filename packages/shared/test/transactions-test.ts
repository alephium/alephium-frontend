import { explorer as e } from '@alephium/web3'

import { getTransactionInfoType2 } from '@/utils/transactions'

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

const expectExplorerGrouplessAddressPage = (tx: e.Transaction, referenceAddress: string) =>
  expect(
    getTransactionInfoType2({
      tx,
      referenceAddress,
      internalAddresses: []
    })
  )

const expectExplorerGroupedAddressPage = (tx: e.Transaction, referenceAddress: string) =>
  expect(
    getTransactionInfoType2({
      tx,
      referenceAddress,
      internalAddresses: []
    })
  )

const expectWalletAddressModal = expectExplorerGroupedAddressPage
const expectExplorerGrouplessSubaddressPage = expectExplorerGroupedAddressPage
const expectWalletActivityScreenWithSingleAddressAsInternal = (tx: e.Transaction, referenceAddress: string) =>
  expect(
    getTransactionInfoType2({
      tx,
      referenceAddress,
      internalAddresses: [referenceAddress]
    })
  )

const makeExpectWalletActivityScreenWithAllAddressesAsInternal =
  (address1: string, address2: string) => (tx: e.Transaction, referenceAddress: string) =>
    expect(
      getTransactionInfoType2({
        tx,
        referenceAddress,
        internalAddresses: [address1, address2]
      })
    )

// grouped address A to groupless subaddress B:X
// https://testnet.alephium.org/transactions/13b9b04bfffed88dddb00001cfc6daaea997ab6fc69f3bf071198b7a44f9127e
it('should get the correct transaction type for grouped to groupless address transfer', () => {
  const tx = transactions.transferFromGroupedToGroupless as e.Transaction
  const fromGroupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'
  const toGrouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const toGrouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGroupedAddress,
    toGrouplessAddress
  )

  expectWalletAddressModal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGrouplessAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, toGrouplessAddress).toEqual('incoming')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGroupedAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGrouplessAddress).toEqual('wallet-self-transfer')

  expectExplorerGroupedAddressPage(tx, fromGroupedAddress).toEqual('outgoing')
  expectExplorerGrouplessAddressPage(tx, toGrouplessAddress).toEqual('incoming')
  expectExplorerGrouplessSubaddressPage(tx, toGrouplessSubaddress).toEqual('incoming')
})

// groupless subaddress A:X to groupless subaddress A:Y
// https://testnet.alephium.org/transactions/8addfdaf65b6c4625790e00719e1fcc5fe97a437ea92969b8b97795d207eb409
it('should get the correct transaction type for groupless internal group transfer', () => {
  const tx = transactions.transferFromGrouplessToSameGrouplessDifferentSubaddress as e.Transaction
  const grouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const fromGrouplessSubaddress1 = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'
  const toGrouplessSubaddress2 = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:1'

  expectWalletAddressModal(tx, grouplessAddress).toEqual('address-group-transfer')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, grouplessAddress).toEqual('address-group-transfer')

  expectExplorerGrouplessAddressPage(tx, grouplessAddress).toEqual('address-group-transfer')
  expectExplorerGrouplessSubaddressPage(tx, fromGrouplessSubaddress1).toEqual('address-group-transfer')
  expectExplorerGrouplessSubaddressPage(tx, toGrouplessSubaddress2).toEqual('address-group-transfer')
})

// groupless subaddress A:X to grouped address B
// https://testnet.alephium.org/transactions/0c7b62713ab0423fca296f1da75f99f78472ad121d9c5f7d45137f0d9a9b97ab
it('should get the correct transaction type for groupless to grouped address transfer', () => {
  const tx = transactions.transfeFromGrouplessToGrouped as e.Transaction
  const fromGrouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const fromGrouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'
  const toGroupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGrouplessAddress,
    toGroupedAddress
  )

  expectWalletAddressModal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGroupedAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, toGroupedAddress).toEqual('incoming')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGrouplessAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGroupedAddress).toEqual('wallet-self-transfer')

  expectExplorerGroupedAddressPage(tx, toGroupedAddress).toEqual('incoming')
  expectExplorerGrouplessAddressPage(tx, fromGrouplessAddress).toEqual('outgoing')
  expectExplorerGrouplessSubaddressPage(tx, fromGrouplessSubaddress).toEqual('outgoing')
})

// groupless subaddress A:X to groupless subaddress B:Y
// https://testnet.alephium.org/transactions/c3fdb69b0c21fbad14d438eee2d68a0234c23b7038a79f2657cdbf2379d3f5c1
it('should get the correct transaction type for groupless to different groupless address transfer', () => {
  const tx = transactions.transferFromGrouplessToDifferentGroupless as e.Transaction
  const fromGrouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const toGrouplessAddress = '3cUt1QzEpcqsbTxrBfxTas6iXzNdWqnoAKeeXpsuai4cHoG5N4ZND'
  const fromGrouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'
  const toGrouplessSubaddress = '3cUt1QzEpcqsbTxrBfxTas6iXzNdWqnoAKeeXpsuai4cHoG5N4ZND:2'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGrouplessAddress,
    toGrouplessAddress
  )

  expectWalletAddressModal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGrouplessAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, toGrouplessAddress).toEqual('incoming')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGrouplessAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGrouplessAddress).toEqual('wallet-self-transfer')

  expectExplorerGrouplessAddressPage(tx, fromGrouplessAddress).toEqual('outgoing')
  expectExplorerGrouplessAddressPage(tx, toGrouplessAddress).toEqual('incoming')
  expectExplorerGrouplessSubaddressPage(tx, fromGrouplessSubaddress).toEqual('outgoing')
  expectExplorerGrouplessSubaddressPage(tx, toGrouplessSubaddress).toEqual('incoming')
})

it('should get the correct transaction type for grouped to the different grouped address transfer', () => {
  const tx = transactions.transferFromGroupedToDifferentGrouped as e.Transaction
  const fromGroupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'
  const toGroupedAddress = '1ChU9K7vgDak4rLVY1DsNqE5E3tpABYPHaWSo9CFuJayb'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGroupedAddress,
    toGroupedAddress
  )

  expectWalletAddressModal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGroupedAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGroupedAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGroupedAddress).toEqual('wallet-self-transfer')

  expectExplorerGroupedAddressPage(tx, fromGroupedAddress).toEqual('outgoing')
  expectExplorerGroupedAddressPage(tx, toGroupedAddress).toEqual('incoming')
})

it('should get the correct transaction type for grouped to the same grouped address transfer', () => {
  const tx = transactions.transferFromGroupedToSameGrouped as e.Transaction
  const groupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  expectWalletAddressModal(tx, groupedAddress).toEqual('address-self-transfer')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, groupedAddress).toEqual('address-self-transfer')
  expectExplorerGroupedAddressPage(tx, groupedAddress).toEqual('address-self-transfer')
})

it('should get the correct transaction type for groupless to the same groupless same subaddress transfer', () => {
  const tx = transactions.transferFromGrouplessToSameGrouplessSameSubaddress as e.Transaction
  const grouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const grouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:1'

  expectWalletAddressModal(tx, grouplessAddress).toEqual('address-self-transfer')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, grouplessAddress).toEqual('address-self-transfer')
  expectExplorerGrouplessAddressPage(tx, grouplessAddress).toEqual('address-self-transfer')
  expectExplorerGrouplessSubaddressPage(tx, grouplessSubaddress).toEqual('address-self-transfer')
})

it('should get the correct transaction type for grouped to contract transfer', () => {
  const tx = transactions.transferFromGroupedToContract as e.Transaction
  const groupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  expectWalletAddressModal(tx, groupedAddress).toEqual('dApp')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, groupedAddress).toEqual('dApp')
  expectExplorerGroupedAddressPage(tx, groupedAddress).toEqual('dApp')
})

it('should get the correct transaction type for contract to grouped address transfer', () => {
  const tx = transactions.transferFromGroupedToContractToGrouped as e.Transaction
  const groupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  expectWalletAddressModal(tx, groupedAddress).toEqual('dApp')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, groupedAddress).toEqual('dApp')
  expectExplorerGroupedAddressPage(tx, groupedAddress).toEqual('dApp')
})
