import AutoUpdateToastBox from '@/features/autoUpdate/AutoUpdateToastBox'
import useLatestGitHubRelease from '@/features/autoUpdate/useLatestGitHubRelease'

const AutoUpdateToastMessages = () => {
  const { newAutoUpdateVersion, newManualUpdateVersion } = useLatestGitHubRelease()

  if (!newAutoUpdateVersion && !newManualUpdateVersion) return null

  return <AutoUpdateToastBox />
}

export default AutoUpdateToastMessages
