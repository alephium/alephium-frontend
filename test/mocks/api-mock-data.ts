export const balanceMockData = {
  data: {
    balance: '0',
    balanceHint: '0 ALPH',
    lockedBalance: '0',
    lockedBalanceHint: '0 ALPH',
    utxoNum: 0
  }
}

export const transactionCreatedMockData = {
  data: {
    unsignedTx: '0ecd20654c2e2be708495853e8da35c664247040c00bd10b9b13',
    txId: '798e9e137aec7c2d59d9655b4ffa640f301f628bf7c365083bb255f6aa5f89ef',
    fromGroup: 2,
    toGroup: 1
  }
}

export const transactionSubmittedMockData = {
  data: {
    txId: '503bfb16230888af4924aa8f8250d7d348b862e267d75d3147f1998050b6da69',
    fromGroup: 2,
    toGroup: 1
  }
}

export const errorMockData = {
  error: {
    detail: 'Error message'
  }
}

export const addressTransactionsMockData = {
  data: [
    {
      hash: 'string',
      blockHash: 'string',
      timestamp: 0,
      inputs: [
        {
          outputRef: {
            scriptHint: 0,
            key: 'string'
          },
          unlockScript: 'string',
          txHashRef: 'string',
          address: 'string',
          amount: 'string'
        }
      ],
      outputs: [
        {
          amount: 'string',
          address: 'string',
          lockTime: 0,
          spent: 'string'
        }
      ],
      gasAmount: 0,
      gasPrice: 'string'
    }
  ]
}

export const addressDetailsMockData = {
  data: {
    balance: 'string',
    txNumber: 0
  }
}
