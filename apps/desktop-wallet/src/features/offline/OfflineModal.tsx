import { WifiOff } from 'lucide-react'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ActionLink from '@/components/ActionLink'
import InfoBox from '@/components/InfoBox'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

const OfflineModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const nodeStatus = useAppSelector((s) => s.network.nodeStatus)
  const explorerStatus = useAppSelector((s) => s.network.explorerStatus)

  return (
    <CenteredModal title={t('Degraded experience')} id={id}>
      <InfoBox
        Icon={WifiOff}
        importance={explorerStatus === 'offline' && nodeStatus === 'offline' ? 'alert' : 'warning'}
        align="left"
      >
        {explorerStatus === 'offline' && nodeStatus === 'offline'
          ? t('There is an issue connecting to the node and explorer backend servers.')
          : explorerStatus === 'offline'
            ? t(
                'The explorer backend is offline. You can still see your balances and send transactions but some data might be missing.'
              )
            : t('The node is offline. You can see your balances but you cannot send transactions.')}
        <br />
        {t('We apologize for the inconvenience.')}
        <br />
        <br />
        <Trans t={t} i18nKey="offlineModalStatusPageMessage">
          Check your network settings and the
          <ActionLink onClick={() => openInWebBrowser(links.statusPage)}>Status page</ActionLink> for updates on this
          issue.
        </Trans>
      </InfoBox>
    </CenteredModal>
  )
})

export default OfflineModal
