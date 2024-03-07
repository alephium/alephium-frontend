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

import { AppMetaData, AppMetadataGitHub, isRcVersion, KEY_APPMETADATA, toAppMetaData } from '@/utils/app-data'
import { useTimeout } from '@/utils/hooks'

// TODO: Move to shared
const ONE_HOUR_IN_MS = 1000 * 60 * 60

interface ThrottledGitHubApiProps {
  key: keyof AppMetadataGitHub
  githubApiCallback: (appMetadata: AppMetaData) => Promise<void>
}

const useThrottledGitHubApi = ({ key, githubApiCallback }: ThrottledGitHubApiProps) => {
  const [timeoutDelay, setTimeoutDelay] = useState(0)

  const timeoutCallback = () => {
    const now = new Date()
    const lastTimeGitHubApiWasCalled = getLastTimeGitHubApiWasCalled(key)
    const timePassedSinceGitHubApiWasCalledInMs = now.getTime() - lastTimeGitHubApiWasCalled.getTime()

    if (timePassedSinceGitHubApiWasCalledInMs > ONE_HOUR_IN_MS) {
      const updatedAppMetadata = storeAppMetadata({ [key]: now })

      setTimeoutDelay(ONE_HOUR_IN_MS)
      githubApiCallback(updatedAppMetadata)
    } else {
      setTimeoutDelay(timePassedSinceGitHubApiWasCalledInMs)
    }
  }

  useTimeout(timeoutCallback, timeoutDelay)
}

const getLastTimeGitHubApiWasCalled = (key: ThrottledGitHubApiProps['key']): Date => {
  const appMetadata = getAppMetadata()
  const lastTimeGitHubApiWasCalled = appMetadata[key]

  return isRcVersion || !lastTimeGitHubApiWasCalled ? new Date(0) : lastTimeGitHubApiWasCalled
}

export const getAppMetadata = (): AppMetaData => {
  try {
    return JSON.parse(localStorage.getItem(KEY_APPMETADATA) ?? '{}', toAppMetaData) ?? {}
  } catch (e) {
    console.error(e)
  }

  return {} as AppMetaData
}

export const storeAppMetadata = (data: Partial<AppMetaData>): AppMetaData => {
  const updatedAppMetadata = { ...getAppMetadata(), ...data }

  localStorage.setItem(KEY_APPMETADATA, JSON.stringify(updatedAppMetadata))

  return updatedAppMetadata
}

export default useThrottledGitHubApi
