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

import { ONE_HOUR_MS } from '@alephium/shared'
import { useState } from 'react'

import {
  AppMetaData,
  AppMetadataGitHub,
  appMetadataJsonParseReviver,
  initialAppMetadataValues,
  isRcVersion,
  KEY_APPMETADATA
} from '@/utils/app-data'
import { useTimeout } from '@/utils/hooks'
interface ThrottledGitHubApiProps {
  lastGithubCallTimestampKey: keyof AppMetadataGitHub
  githubApiCallback: (appMetadata: AppMetaData) => Promise<void>
}

const useThrottledGitHubApi = ({ lastGithubCallTimestampKey, githubApiCallback }: ThrottledGitHubApiProps) => {
  const [timeoutDelay, setTimeoutDelay] = useState(0)

  const timeoutCallback = () => {
    const now = new Date()
    const lastTimeGitHubApiWasCalled = getLastTimeGitHubApiWasCalled(lastGithubCallTimestampKey)
    const timePassedSinceGitHubApiWasCalledInMs = now.getTime() - lastTimeGitHubApiWasCalled.getTime()

    if (timePassedSinceGitHubApiWasCalledInMs > ONE_HOUR_MS) {
      const updatedAppMetadata = storeAppMetadata({ [lastGithubCallTimestampKey]: now })

      setTimeoutDelay(ONE_HOUR_MS)
      githubApiCallback(updatedAppMetadata)
    } else {
      setTimeoutDelay(timePassedSinceGitHubApiWasCalledInMs)
    }
  }

  useTimeout(timeoutCallback, timeoutDelay)
}

const getLastTimeGitHubApiWasCalled = (
  lastGithubCallTimestampKey: ThrottledGitHubApiProps['lastGithubCallTimestampKey']
): Date => {
  const appMetadata = getAppMetadata()
  const lastTimeGitHubApiWasCalled = appMetadata[lastGithubCallTimestampKey]

  return isRcVersion || !lastTimeGitHubApiWasCalled ? new Date(0) : lastTimeGitHubApiWasCalled
}

export const getAppMetadata = (): AppMetaData => {
  const appMetadata = localStorage.getItem(KEY_APPMETADATA)

  try {
    return appMetadata ? JSON.parse(appMetadata, appMetadataJsonParseReviver) : initialAppMetadataValues
  } catch (e) {
    console.error(e)
  }

  return initialAppMetadataValues
}

export const storeAppMetadata = (data: Partial<AppMetaData>): AppMetaData => {
  const updatedAppMetadata = { ...getAppMetadata(), ...data }

  localStorage.setItem(KEY_APPMETADATA, JSON.stringify(updatedAppMetadata))

  return updatedAppMetadata
}

export default useThrottledGitHubApi
