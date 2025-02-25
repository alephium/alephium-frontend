import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import useAnalytics from '@/features/analytics/useAnalytics'
import useLatestGitHubRelease from '@/features/autoUpdate/useLatestGitHubRelease'
import ToastBox from '@/features/toastMessages/ToastBox'
import { currentVersion } from '@/utils/app-data'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

type UpdateStatus = 'download-available' | 'downloading' | 'download-finished' | 'download-failed'

const AutoUpdateToastBox = () => {
  const { t } = useTranslation()
  const { newAutoUpdateVersion, newManualUpdateVersion } = useLatestGitHubRelease()
  const { sendAnalytics } = useAnalytics()

  const [isUpdateSnackbarVisible, setIsUpdateSnackbarVisible] = useState(true)
  const [status, setStatus] = useState<UpdateStatus>('download-available')
  const [percent, setPercent] = useState('0')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!newAutoUpdateVersion) return

    let timer: ReturnType<typeof setTimeout>

    setStatus('downloading')

    const removeUpdateDownloadProgressListener = window.electron?.updater.onUpdateDownloadProgress((info) =>
      setPercent(info.percent.toFixed(2))
    )
    const removeUpdateDownloadedListener = window.electron?.updater.onUpdateDownloaded(() => {
      // Delay success message to give time for download validation errors to arise if any
      timer = setTimeout(() => setStatus('download-finished'), 1000)
    })
    const removeonErrorListener = window.electron?.updater.onError((error) => {
      setStatus('download-failed')
      setError(error.toString())
      sendAnalytics({ type: 'error', error, message: 'Auto-update download failed' })
    })

    window.electron?.updater.startUpdateDownload()

    return () => {
      removeUpdateDownloadProgressListener && removeUpdateDownloadProgressListener()
      removeUpdateDownloadedListener && removeUpdateDownloadedListener()
      removeonErrorListener && removeonErrorListener()
      if (timer) clearTimeout(timer)
    }
  }, [newAutoUpdateVersion, sendAnalytics])

  const newVersion = newAutoUpdateVersion || newManualUpdateVersion

  if (!newVersion || !isUpdateSnackbarVisible) return null

  const handleManualDownloadClick = () => {
    openInWebBrowser(links.latestRelease)
    closeSnackbar()
    sendAnalytics({
      event: 'Auto-update modal: Clicked "Download"',
      props: { fromVersion: currentVersion, toVersion: newManualUpdateVersion }
    })
  }

  const handleRestartClick = () => {
    sendAnalytics({ event: 'Auto-update modal: Clicked "Restart"' })
    window.electron?.updater.quitAndInstallUpdate()
  }

  const closeSnackbar = () => {
    setIsUpdateSnackbarVisible(false)
    sendAnalytics({ event: 'Auto-update modal: Closed' })
  }

  const downloadTitle = {
    'download-available': t('Version {{ newVersion }} is available', { newVersion }),
    'download-finished': t('Download finished'),
    'download-failed': t('Download failed'),
    downloading: t('Downloading version {{ newVersion }}...', { newVersion })
  }[status]

  const downloadMessage = {
    'download-available': t('Please, download it and install it to avoid any issues with the wallet.'),
    'download-finished': t('Restart the application to install the new update.'),
    'download-failed': t('Try again later.'),
    downloading: ''
  }[status]

  return (
    <ToastBox
      type={error ? 'error' : status === 'download-finished' ? 'success' : 'info'}
      onClose={closeSnackbar}
      title={downloadTitle}
      FooterButtons={
        <>
          {status === 'download-available' && newManualUpdateVersion && (
            <Button wide squared onClick={handleManualDownloadClick}>
              {t('Download')}
            </Button>
          )}
          {status === 'download-finished' && !error && (
            <Button wide squared role="secondary" onClick={handleRestartClick}>
              {t('Restart')}
            </Button>
          )}
        </>
      }
    >
      <Texts>
        <div>{error ? error : downloadMessage}</div>
        {status === 'downloading' && <ProgressBar value={parseFloat(percent) / 100} />}
      </Texts>
    </ToastBox>
  )
}

export default AutoUpdateToastBox

const Texts = styled.div`
  flex: 1;
`

const ProgressBar = styled.progress`
  width: 100%;
`
