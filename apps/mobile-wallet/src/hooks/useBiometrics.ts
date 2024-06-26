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
  authenticateAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  LocalAuthenticationResult
} from 'expo-local-authentication'
import { useCallback } from 'react'

import { useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'

export const useBiometrics = () => {
  const { data: deviceSupportsBiometrics } = useAsyncData(hasHardwareAsync)
  const { data: deviceHasEnrolledBiometrics } = useAsyncData(isEnrolledAsync)

  return { deviceSupportsBiometrics, deviceHasEnrolledBiometrics }
}

// Copied from Uniswap and adapted

/**
 * Biometric authentication statuses
 * Note. Sorted by authentication level
 */
export enum BiometricAuthenticationStatus {
  Unsupported = 'UNSUPPORTED',
  MissingEnrollment = 'MISSING_ENROLLMENT',
  Rejected = 'REJECTED',
  Authenticated = 'AUTHENTICATED',
  Canceled = 'CANCELED',
  Authenticating = 'AUTHENTICATING',
  Lockout = 'LOCKOUT',
  UserCancel = 'USER_CANCEL',
  SystemCancel = 'SYSTEM_CANCEL',
  Invalid = 'INVALID'
}

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
  const triggerBiometricsPrompt = async (args?: TriggerArgs<T>): Promise<void> => {
    const authStatus = await tryLocalAuthenticate()

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

export async function tryLocalAuthenticate(): Promise<BiometricAuthenticationStatus> {
  try {
    const compatible = await hasHardwareAsync()

    if (!compatible) {
      return BiometricAuthenticationStatus.Unsupported
    }

    /**
     * Important: ExpoLocalAuthentication.isEnrolledAsync() method nested in isEnrolledAsync() returns false when
                  when users exceeds the amount of retries. Exactly the same when user has no biometric setup on the device
                  and thats why we have to call authenticateAsync to be able to distinguish between different errors.
     */
    const enrolled = await isEnrolledAsync()
    const result = await authenticateAsync({
      cancelLabel: 'Cancel',
      promptMessage: 'Please authenticate',
      requireConfirmation: false
    })

    if (result.success === true) {
      return BiometricAuthenticationStatus.Authenticated
    }

    if (isInLockout(result)) {
      return BiometricAuthenticationStatus.Lockout
    }

    if (isCanceledByUser(result)) {
      return BiometricAuthenticationStatus.UserCancel
    }

    if (isCanceledBySystem(result)) {
      return BiometricAuthenticationStatus.SystemCancel
    }

    if (!enrolled) {
      return BiometricAuthenticationStatus.MissingEnrollment
    }

    return BiometricAuthenticationStatus.Rejected
  } catch (error) {
    // logger.error(error, { tags: { file: 'biometrics/index', function: 'tryLocalAuthenticate' } })

    return BiometricAuthenticationStatus.Rejected
  }
}

export const useBiometricsAuthGuard = () => {
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const biometricsRequiredForTransactions = useAppSelector((s) => s.settings.requireAuth)
  const { triggerBiometricsPrompt } = useBiometricPrompt()

  const triggerBiometricsAuthGuard = useCallback(
    async ({
      successCallback,
      failureCallback,
      onPromptDisplayed,
      settingsToCheck
    }: {
      settingsToCheck: 'appAccess' | 'transactions' | 'appAccessOrTransactions'
      successCallback: () => void
      failureCallback?: () => void
      onPromptDisplayed?: () => void
    }) => {
      const isBiometricsAuthRequired = {
        appAccess: biometricsRequiredForAppAccess,
        transactions: biometricsRequiredForTransactions,
        appAccessOrTransactions: biometricsRequiredForAppAccess || biometricsRequiredForTransactions
      }[settingsToCheck]

      if (isBiometricsAuthRequired) {
        onPromptDisplayed && onPromptDisplayed()
        await triggerBiometricsPrompt({ successCallback, failureCallback })
      } else {
        successCallback()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [biometricsRequiredForAppAccess, biometricsRequiredForTransactions]
  )

  return { triggerBiometricsAuthGuard }
}

const isInLockout = (result: LocalAuthenticationResult): boolean =>
  result.success === false && result.error === 'lockout'

const isCanceledByUser = (result: LocalAuthenticationResult): boolean =>
  result.success === false && result.error === 'user_cancel'

const isCanceledBySystem = (result: LocalAuthenticationResult): boolean =>
  result.success === false && result.error === 'system_cancel'

const biometricAuthenticationSuccessful = (status: BiometricAuthenticationStatus): boolean =>
  status === BiometricAuthenticationStatus.Authenticated

const biometricAuthenticationDisabledByOS = (status: BiometricAuthenticationStatus): boolean =>
  status === BiometricAuthenticationStatus.Unsupported || status === BiometricAuthenticationStatus.MissingEnrollment
