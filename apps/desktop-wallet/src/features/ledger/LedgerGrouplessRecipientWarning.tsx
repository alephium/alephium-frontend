import { isGrouplessAddress, isValidAddress } from '@alephium/web3'
import { AlertTriangle } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import InfoBox from '@/components/InfoBox'
import { useLedger } from '@/features/ledger/useLedger'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface LedgerGrouplessRecipientWarningProps {
  toAddress: string
}

const LedgerGrouplessRecipientWarning = ({ toAddress }: LedgerGrouplessRecipientWarningProps) => {
  const { t } = useTranslation()
  const { isLedger } = useLedger()

  // isGrouplessAddress throws on anything it cannot decode, and the field is read while it is still being typed
  if (!isLedger || !isValidAddress(toAddress) || !isGrouplessAddress(toAddress)) return null

  return (
    <InfoBoxStyled importance="alert" Icon={AlertTriangle} align="left">
      <Trans t={t} i18nKey="ledgerGrouplessRecipientWarning">
        Sending to groupless addresses is not supported by the Alephium Ledger app yet. Support is being worked on, you
        can follow it <ActionLink onClick={() => openInWebBrowser(links.ledgerGrouplessSupport)}>on GitHub</ActionLink>.
        Sending to addresses that start with a 1 works as expected.
      </Trans>
    </InfoBoxStyled>
  )
}

export default LedgerGrouplessRecipientWarning

// The column this sits in has no gap of its own, so without this the box touches the destination section above it
const InfoBoxStyled = styled(InfoBox)`
  margin-top: var(--spacing-4);
`
