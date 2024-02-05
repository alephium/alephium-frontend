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

import { useState } from 'react'

import { AppMetaData, isRcVersion, KEY_APPMETADATA, toAppMetaData } from '@/utils/app-data'
import { useTimeout } from '@/utils/hooks'

// TODO: Move to shared
const ONE_HOUR = 1000 * 60 * 60

const useThrottledGitHubApi = (callback: (latestAppMetaData: AppMetaData) => Promise<void>) => {
  const [timeUntilNextCheck, setTimeUntilNextCheck] = useState(0)

  useTimeout(() => {
    const appData = getAppMetadata()
    const { lastCheckedAt } = isRcVersion ? { lastCheckedAt: new Date(0) } : appData
    const timeSinceLastCheck = (lastCheckedAt !== undefined && Date.now() - lastCheckedAt.getTime()) || 0
    const nextTimeUntilNextCheck = Math.max(0, ONE_HOUR - timeSinceLastCheck)

    if (timeUntilNextCheck === 0 && nextTimeUntilNextCheck !== 0 && lastCheckedAt !== undefined) {
      setTimeUntilNextCheck(nextTimeUntilNextCheck)
      return
    }

    const latestAppMetaData = { ...appData, lastCheckedAt: new Date() }

    storeAppMetadata(latestAppMetaData)
    setTimeUntilNextCheck(nextTimeUntilNextCheck)

    callback(latestAppMetaData)
  }, timeUntilNextCheck)
}

export const getAppMetadata = (): AppMetaData => {
  try {
    return JSON.parse(localStorage.getItem(KEY_APPMETADATA) ?? '{}', toAppMetaData) ?? {}
  } catch (e) {
    console.error(e)
  }

  return {} as AppMetaData
}

export const storeAppMetadata = (data: Partial<AppMetaData>) =>
  localStorage.setItem(KEY_APPMETADATA, JSON.stringify({ ...getAppMetadata(), ...data }))

export default useThrottledGitHubApi
