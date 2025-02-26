import { AddressHash } from '@alephium/shared'
import { ExternalLinkIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Box, { BoxProps } from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { useAppSelector } from '@/hooks/redux'
import { Address } from '@/types/addresses'
import { openInWebBrowser } from '@/utils/misc'

interface CheckAddressesBoxProps extends BoxProps {
  fromAddress: Address
  toAddressHash?: AddressHash
  dAppUrl?: string
  className?: string
}

const CheckAddressesBox = ({ fromAddress, toAddressHash, dAppUrl, ...props }: CheckAddressesBoxProps) => {
  const { t } = useTranslation()

  return (
    <Box {...props}>
      <AddressRow>
        <AddressLabel>{t('From')}</AddressLabel>

        <AddressBadge addressHash={fromAddress.hash} truncate appendHash withBorders />
      </AddressRow>

      {(toAddressHash || dAppUrl) && (
        <>
          <HorizontalDivider secondary />
          <AddressRow>
            <AddressLabel>{t('To')}</AddressLabel>

            {toAddressHash && (
              <DestinationAddress>
                <AddressBadge addressHash={toAddressHash} truncate appendHash withBorders fullWidthUnknownHash />
                <ExplorerLink addressHash={toAddressHash} />
              </DestinationAddress>
            )}
            {dAppUrl && <DestinationAddress>{dAppUrl}</DestinationAddress>}
          </AddressRow>
        </>
      )}
    </Box>
  )
}

export default CheckAddressesBox

const ExplorerLink = ({ addressHash }: { addressHash: AddressHash }) => {
  const { t } = useTranslation()
  const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  return (
    <ActionLinkStyled
      onClick={() => openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)}
      tooltip={t('Show in explorer')}
    >
      <ExternalLinkIcon size={12} />
    </ActionLinkStyled>
  )
}

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  gap: 20px;
`

const AddressLabel = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`

const DestinationAddress = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  position: relative;
`

const ActionLinkStyled = styled(ActionLink)`
  position: absolute;
  right: 7px;
  bottom: -17px;
`
