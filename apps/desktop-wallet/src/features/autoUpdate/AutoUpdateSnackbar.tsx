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

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import Button from '@/components/Button'
import { SnackbarManagerContainer } from '@/components/SnackbarManager'
import useAnalytics from '@/features/analytics/useAnalytics'
import useLatestGitHubRelease from '@/features/autoUpdate/useLatestGitHubRelease'
import SnackbarBox from '@/features/snackbar/SnackbarBox'
import ModalPortal from '@/modals/ModalPortal'
import { currentVersion } from '@/utils/app-data'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

type UpdateStatus = 'download-available' | 'downloading' | 'download-finished' | 'download-failed'

const AutoUpdateSnackbar = () => {
  const { t } = useTranslation()
  const { newVersion, requiresManualDownload } = useLatestGitHubRelease()
  const { sendAnalytics } = useAnalytics()

  const [isUpdateSnackbarVisible, setIsUpdateSnackbarVisible] = useState(true)
  const [status, setStatus] = useState<UpdateStatus>('download-available')
  const [percent, setPercent] = useState('0')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!newVersion || requiresManualDownload) return

    let timer: ReturnType<typeof setTimeout>

    setStatus('downloading')
    window.electron?.updater.startUpdateDownload()

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

    return () => {
      removeUpdateDownloadProgressListener && removeUpdateDownloadProgressListener()
      removeUpdateDownloadedListener && removeUpdateDownloadedListener()
      removeonErrorListener && removeonErrorListener()
      if (timer) clearTimeout(timer)
    }
  }, [newVersion, requiresManualDownload, sendAnalytics])

  if (!newVersion) return null

  const handleManualDownloadClick = () => {
    openInWebBrowser(links.latestRelease)
    closeSnackbar()
    sendAnalytics({
      event: 'Auto-update modal: Clicked "Download"',
      props: { fromVersion: currentVersion, toVersion: newVersion }
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
    <ModalPortal>
      {isUpdateSnackbarVisible && (
        <SnackbarManagerContainer>
          <SnackbarPopupWithButton
            {...fadeInBottom}
            {...fadeOut}
            className={error ? 'alert' : status === 'download-finished' ? 'success' : 'info'}
          >
            <Texts>
              <Title>{downloadTitle}</Title>
              <div>{error ? error : downloadMessage}</div>
              {status === 'downloading' && <ProgressBar value={parseFloat(percent) / 100} />}
            </Texts>
            {error && (
              <CloseButton aria-label={t('Close')} circle role="secondary" transparent onClick={closeSnackbar}>
                <X />
              </CloseButton>
            )}
            {status === 'download-available' && requiresManualDownload && (
              <Button short onClick={handleManualDownloadClick}>
                {t('Download')}
              </Button>
            )}
            {status === 'download-finished' && !error && (
              <Button short role="secondary" onClick={handleRestartClick}>
                {t('Restart')}
              </Button>
            )}
          </SnackbarPopupWithButton>
        </SnackbarManagerContainer>
      )}
    </ModalPortal>
  )
}

export default AutoUpdateSnackbar

const Texts = styled.div`
  flex: 1;
`

const Title = styled.div`
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: var(--spacing-1);
`

const ProgressBar = styled.progress`
  width: 100%;
`

const SnackbarPopupWithButton = styled(SnackbarBox)`
  display: flex;
  gap: var(--spacing-2);
  width: 400px;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  margin-right: var(--spacing-2);
`
