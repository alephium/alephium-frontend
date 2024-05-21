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

import { BellPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import { useGlobalContext } from '@/contexts/global'
import useAnalytics from '@/features/analytics/useAnalytics'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { AlephiumWindow } from '@/types/window'
import { currentVersion } from '@/utils/app-data'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface UpdateWalletModalProps {
  onClose: () => void
}

type UpdateStatus = 'download-available' | 'downloading' | 'download-finished' | 'download-failed'

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

const UpdateWalletModal = ({ onClose }: UpdateWalletModalProps) => {
  const { t } = useTranslation()
  const { resetNewVersionDownloadTrigger, newVersion, newVersionDownloadTriggered, requiresManualDownload } =
    useGlobalContext()
  const { sendAnalytics } = useAnalytics()

  const [status, setStatus] = useState<UpdateStatus>('download-available')
  const [percent, setPercent] = useState('0')
  const [error, setError] = useState('')

  const startDownload = async () => {
    setStatus('downloading')
    electron?.updater.startUpdateDownload()
  }

  useEffect(() => {
    const removeUpdateDownloadProgressListener = electron?.updater.onUpdateDownloadProgress((info) =>
      setPercent(info.percent.toFixed(2))
    )
    const removeUpdateDownloadedListener = electron?.updater.onUpdateDownloaded(() => {
      // Delay success message to give time for download validation errors to arise if any
      setTimeout(() => setStatus('download-finished'), 1000)
    })
    const removeonErrorListener = electron?.updater.onError((error) => {
      setStatus('download-failed')
      setError(error.toString())
      sendAnalytics({ type: 'error', error, message: 'Auto-update download failed' })
    })

    return () => {
      removeUpdateDownloadProgressListener && removeUpdateDownloadProgressListener()
      removeUpdateDownloadedListener && removeUpdateDownloadedListener()
      removeonErrorListener && removeonErrorListener
    }
  }, [sendAnalytics])

  useEffect(() => {
    if (newVersionDownloadTriggered) startDownload()
  }, [newVersionDownloadTriggered])

  const closeModal = () => {
    resetNewVersionDownloadTrigger()
    onClose()
    sendAnalytics({ event: 'Auto-update modal: Closed' })
  }

  const handleUpdateClick = () => {
    startDownload()
    sendAnalytics({
      event: 'Auto-update modal: Clicked "Update"',
      props: { fromVersion: currentVersion, toVersion: newVersion }
    })
  }

  const handleManualDownloadClick = () => {
    openInWebBrowser(links.latestRelease)
    sendAnalytics({
      event: 'Auto-update modal: Clicked "Download"',
      props: { fromVersion: currentVersion, toVersion: newVersion }
    })
  }

  const handleRestartClick = () => {
    sendAnalytics({ event: 'Auto-update modal: Clicked "Restart"' })
    electron?.updater.quitAndInstallUpdate()
  }

  const downloadMessage = {
    'download-available': t(
      requiresManualDownload
        ? 'Version {{ newVersion }} is available. Please, download it and install it to avoid any issues with the wallet.'
        : 'Version {{ newVersion }} is available. Click "Update" to avoid any issues with the wallet.',
      {
        newVersion
      }
    ),
    'download-finished': t('Restart the application to install the new update.'),
    'download-failed': t('Download failed, try again later.'),
    downloading: t('Downloaded {{ percent }}%', { percent })
  }[status]

  return (
    <CenteredModal title={t('New version')} onClose={closeModal} focusMode>
      <Section>
        <InfoBox Icon={BellPlus}>
          <div>{error ? error : downloadMessage}</div>
          {status === 'downloading' && <ProgressBar value={parseFloat(percent) / 100} />}
        </InfoBox>
      </Section>
      <ModalFooterButtons>
        {status === 'download-available' && requiresManualDownload && (
          <ModalFooterButton onClick={handleManualDownloadClick}>{t('Download')}</ModalFooterButton>
        )}
        {status === 'download-available' && !requiresManualDownload && (
          <ModalFooterButton onClick={handleUpdateClick}>{t('Update')}</ModalFooterButton>
        )}
        {status === 'download-finished' && !error && (
          <ModalFooterButton onClick={handleRestartClick}>{t('Restart')}</ModalFooterButton>
        )}
        {error && <ModalFooterButton onClick={closeModal}>{t('Close')}</ModalFooterButton>}
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default UpdateWalletModal

const ProgressBar = styled.progress`
  width: 100%;
`
