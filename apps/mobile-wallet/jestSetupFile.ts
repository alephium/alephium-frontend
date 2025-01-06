// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.self = global as any // workaround for web3 import causing error while running tests

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
