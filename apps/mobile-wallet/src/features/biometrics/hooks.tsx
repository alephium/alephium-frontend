/*
Copyright 2018 - 2024 The Alephium Authors
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

import {
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync
} from 'expo-local-authentication'

import { BiometricAuthenticationStatus, tryLocalAuthenticate } from '~/features/biometrics'
import { useBiometricContext } from '~/features/biometrics/context'
import { useAsyncData } from '~/hooks/useAsyncData'
import { isAndroid } from '~/utils/platform'

// Copied from Uniswap and adapted

type TriggerArgs<T> = {
  params?: T
  successCallback?: (params?: T) => void
  failureCallback?: () => void
}

/**
 * Hook shortcut to use the biometric prompt.
 *
 * It can be used by either declaring the success/failure callbacks at the time you call the hook,
 * or by declaring them when you call the trigger function:
 *
 * Example 1:
 *
 * ```ts
 * const { trigger } = useBiometricPrompt(() => { success() }, () => { failure() })
 * triger({
 *   params: { ... },
 * })
 * ```
 *
 * Example 2:
 *
 * ```ts
 * const { trigger } = useBiometricPrompt()
 * triger({
 *  successCallback: () => { success() },
 *  failureCallback: () => { success() },
 *  params: { ... },
 * })
 * ```
 *
 * TODO(MOB-2523): standardize usage of this hook and remove the style of Example 1.
 *
 * @returns trigger Trigger the OS biometric flow and invokes successCallback on success.
 */
export function useBiometricPrompt<T = undefined>(
  successCallback?: (params?: T) => void,
  failureCallback?: () => void
): {
  triggerBiometricsPrompt: (args?: TriggerArgs<T>) => Promise<void>
} {
  const { setAuthenticationStatus } = useBiometricContext()

  const triggerBiometricsPrompt = async (args?: TriggerArgs<T>): Promise<void> => {
    setAuthenticationStatus(BiometricAuthenticationStatus.Authenticating)
    const authStatus = await tryLocalAuthenticate()

    setAuthenticationStatus(authStatus)

    const _successCallback = args?.successCallback ?? successCallback
    const _failureCallback = args?.failureCallback ?? failureCallback

    if (biometricAuthenticationSuccessful(authStatus) || biometricAuthenticationDisabledByOS(authStatus)) {
      _successCallback?.(args?.params)
    } else {
      _failureCallback?.()
    }
  }

  return { triggerBiometricsPrompt }
}

export function biometricAuthenticationSuccessful(status: BiometricAuthenticationStatus): boolean {
  return status === BiometricAuthenticationStatus.Authenticated
}

export function biometricAuthenticationRejected(status: BiometricAuthenticationStatus): boolean {
  return status === BiometricAuthenticationStatus.Rejected
}

export function biometricAuthenticationDisabledByOS(status: BiometricAuthenticationStatus): boolean {
  return (
    status === BiometricAuthenticationStatus.Unsupported || status === BiometricAuthenticationStatus.MissingEnrollment
  )
}

/**
 * Check function of biometric device support
 * @returns object representing biometric auth support by type
 */
export function useDeviceSupportsBiometricAuth(): { touchId: boolean; faceId: boolean } {
  // check if device supports biometric authentication
  const authenticationTypes = useAsyncData(supportedAuthenticationTypesAsync).data
  return {
    touchId: authenticationTypes?.includes(AuthenticationType.FINGERPRINT) ?? false,
    faceId: authenticationTypes?.includes(AuthenticationType.FACIAL_RECOGNITION) ?? false
  }
}

export const checkOsBiometricAuthEnabled = async (): Promise<boolean> => {
  const [compatible, enrolled] = await Promise.all([hasHardwareAsync(), isEnrolledAsync()])
  return compatible && enrolled
}

/**
 * Hook to determine whether biometric auth is enabled in OS settings
 * @returns if Face ID or Touch ID is enabled
 */
export function useOsBiometricAuthEnabled(): boolean | undefined {
  return useAsyncData(checkOsBiometricAuthEnabled).data
}

export function useBiometricName(isTouchIdSupported: boolean, shouldCapitalize?: boolean): string {
  if (isAndroid) {
    return shouldCapitalize ? 'Biometrics' : 'biometrics'
  }

  // iOS is always capitalized
  return isTouchIdSupported ? 'Touch ID' : 'Face ID'
}
