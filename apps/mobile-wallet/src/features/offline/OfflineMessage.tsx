import { useIsExplorerOffline, useIsNodeOffline } from '@alephium/shared-react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Surface from '~/components/layout/Surface'
import LinkToWeb from '~/components/text/LinkToWeb'

const OfflineMessage = () => {
  const { t } = useTranslation()
  const isNodeOffline = useIsNodeOffline()
  const isExplorerOffline = useIsExplorerOffline()

  const bothOffline = isNodeOffline && isExplorerOffline

  return (
    <OfflineMessageStyled type="accent">
      <AppText>
        {bothOffline
          ? t('There is an issue connecting to the node and explorer backend servers.')
          : isExplorerOffline
            ? t(
                'The explorer backend is offline. You can still see your balances and send transactions but some data might be missing.'
              )
            : t('The node is offline. You can see your balances but you cannot send transactions.')}
      </AppText>

      <AppText>{t('We apologize for the inconvenience.')}</AppText>
      <AppText>
        <Trans t={t} i18nKey="offlineModalStatusPageMessage">
          Check your network settings and the
          <LinkToWeb url="https://status.alephium.org">Status page</LinkToWeb> for updates on this issue.
        </Trans>
      </AppText>
    </OfflineMessageStyled>
  )
}

export default OfflineMessage

const OfflineMessageStyled = styled(Surface)`
  padding: 20px;
  margin-bottom: 10px;
`
