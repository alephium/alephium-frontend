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
import { NativeModulesProxy } from 'expo-modules-core'

// Copied from Uniswap and adapted

const ELA = NativeModulesProxy.ExpoLocalAuthentication

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

export async function enroll(): Promise<void> {
  ELA?.enrollForAuthentication()
}

// TODO: [MOB-220] Move into a saga
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
      requireConfirmation: false,
      disableDeviceFallback: true
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

const isInLockout = (result: LocalAuthenticationResult): boolean =>
  result.success === false && result.error === 'lockout'

const isCanceledByUser = (result: LocalAuthenticationResult): boolean =>
  result.success === false && result.error === 'user_cancel'

const isCanceledBySystem = (result: LocalAuthenticationResult): boolean =>
  result.success === false && result.error === 'system_cancel'
