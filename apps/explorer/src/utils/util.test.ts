import { checkHexStringValidity, smartHash } from './strings'

it('Should return a "smart hash"', () => {
  expect(smartHash('00002f884288e1f4')).toEqual('00002f884288e1f4'),
    expect(smartHash('00002f884288e1f48')).toEqual('00002f88...288e1f48'),
    expect(smartHash('00002f884288e1f4882b8bba09e7a0f1e6339ebabcef27e58e489090b792a820')).toEqual('00002f88...b792a820')
})

it('Should return true if is HEX string', () => {
  expect(checkHexStringValidity('00000091f9a011ff1cb23686d650dbde57e2b91c5a6aa6e4115291d3de432b0c')).toEqual(true),
    expect(checkHexStringValidity('78dd3fe6b0a52ef895b1575284deaa7826bea8fc89beb6984b3b41e9f800395d')).toEqual(true),
    expect(checkHexStringValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFX0')).toEqual(false),
    expect(
      checkHexStringValidity(
        'WzbegYW2DgnouXKdMQGHcXKfgmTkvAomrvG9Dtw4vGpCrHdq4EzoFdaZPsR5zZHuVvEYD5Dw7Yf3X4PapL5M9RF62GsPaTtHdXYuxXfbbynwQ9WkiEai9Q9iD5yE55nNwGZkC9'
      )
    ).toEqual(false)
})
