import { useIsExplorerOffline, useIsNodeOffline } from '@alephium/shared-react'
import { WifiOff } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import InfoBox from '@/components/InfoBox'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

const OfflineMessage = () => {
  const { t } = useTranslation()
  const isNodeOffline = useIsNodeOffline()
  const isExplorerOffline = useIsExplorerOffline()

  const bothOffline = isNodeOffline && isExplorerOffline

  return (
    <InfoBoxStyled Icon={WifiOff} importance={bothOffline ? 'alert' : 'warning'} align="left">
      {bothOffline
        ? t('There is an issue connecting to the node and explorer backend servers.')
        : isExplorerOffline
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
    </InfoBoxStyled>
  )
}

export default OfflineMessage

const InfoBoxStyled = styled(InfoBox)`
  margin-bottom: 0;
  border-radius: 0;
  height: 100% !important;
  flex: 1;
`
