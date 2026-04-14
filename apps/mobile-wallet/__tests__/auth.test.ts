import { authenticateAsync, hasHardwareAsync, isEnrolledAsync } from 'expo-local-authentication'

import { BiometricAuthenticationStatus, tryLocalAuthenticate } from '~/hooks/useBiometrics'

// Copied from Uniswap

const mockedHasHardwareAsync = vi.mocked(hasHardwareAsync)
const mockedIsEnrolledAsync = vi.mocked(isEnrolledAsync)
const mockedAuthenticateAsync = vi.mocked(authenticateAsync)

describe(tryLocalAuthenticate, () => {
  it('checks hardware compatibility', async () => {
    mockedHasHardwareAsync.mockResolvedValue(false)

    const status = await tryLocalAuthenticate()

    expect(status).toEqual(BiometricAuthenticationStatus.Unsupported)
  })

  it('checks enrollement', async () => {
    mockedHasHardwareAsync.mockResolvedValue(true)
    mockedIsEnrolledAsync.mockResolvedValue(false)
    mockedAuthenticateAsync.mockResolvedValue({ success: false, error: 'not_enrolled' })

    const status = await tryLocalAuthenticate()

    expect(status).toEqual(BiometricAuthenticationStatus.MissingEnrollment)
  })

  it('fails to authenticate when user rejects', async () => {
    mockedHasHardwareAsync.mockResolvedValue(true)
    mockedIsEnrolledAsync.mockResolvedValue(true)
    mockedAuthenticateAsync.mockResolvedValue({ success: false, error: 'user_cancel' })

    const status = await tryLocalAuthenticate()

    expect(status).toEqual(BiometricAuthenticationStatus.UserCancel)
  })

  it('authenticates when user accepts', async () => {
    mockedHasHardwareAsync.mockResolvedValue(true)
    mockedIsEnrolledAsync.mockResolvedValue(true)
    mockedAuthenticateAsync.mockResolvedValue({ success: true })

    const status = await tryLocalAuthenticate()

    expect(status).toEqual(BiometricAuthenticationStatus.Authenticated)
  })

  it('always return authenticated when disabled', async () => {
    const status = await tryLocalAuthenticate()

    expect(status).toEqual(BiometricAuthenticationStatus.Authenticated)
  })
})
