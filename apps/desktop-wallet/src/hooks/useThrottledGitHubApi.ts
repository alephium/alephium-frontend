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
