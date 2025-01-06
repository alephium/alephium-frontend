import { exponentialBackoffFetchRetry } from '@alephium/shared'
import { compareVersions } from 'compare-versions'
import { useState } from 'react'

import useAnalytics from '@/features/analytics/useAnalytics'
import useThrottledGitHubApi from '@/hooks/useThrottledGitHubApi'
import { currentVersion, isRcVersion } from '@/utils/app-data'
import { links } from '@/utils/links'

const semverRegex = isRcVersion ? /^(\d+\.\d+\.\d+)(?:-rc(\.\d+)?)?$/ : /^(\d+\.\d+\.\d+)?$/

const useLatestGitHubRelease = () => {
  const { sendAnalytics } = useAnalytics()

  const [newVersion, setNewVersion] = useState('')
  const [requiresManualDownload, setRequiresManualDownload] = useState(false)

  const checkForManualDownload = async () => {
    try {
      const response = await exponentialBackoffFetchRetry(links.latestReleaseApi)
      const data = await response.json()
      const version = data?.tag_name?.replace('alephium-desktop-wallet@', '')

      if (version && isVersionNewer(version)) {
        setNewVersion(version)
        setRequiresManualDownload(true)
      }
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Checking for latest release version for manual download' })
    }
  }

  useThrottledGitHubApi({
    lastGithubCallTimestampKey: 'lastTimeGitHubApiWasCalledForLatestVersion',
    githubApiCallback: async () => {
      const version = await window.electron?.updater.checkForUpdates()

      if (!version) {
        await checkForManualDownload()
      } else if (isVersionNewer(version)) {
        setNewVersion(version)
      }
    }
  })

  return { newVersion, requiresManualDownload }
}

export default useLatestGitHubRelease

const isVersionNewer = (version: string): boolean =>
  semverRegex.test(version) && !!currentVersion && compareVersions(version, currentVersion) > 0
