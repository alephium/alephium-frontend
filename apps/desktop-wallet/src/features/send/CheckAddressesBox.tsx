import { AddressHash } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import HashEllipsed from '@/components/HashEllipsed'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectContactByAddress } from '@/storage/addresses/addressesSelectors'
import { Address } from '@/types/addresses'
import { openInWebBrowser } from '@/utils/misc'

interface CheckAddressesBoxProps {
  fromAddress: Address
  toAddressHash?: AddressHash
  className?: string
}

const CheckAddressesBox = ({ fromAddress, toAddressHash, className }: CheckAddressesBoxProps) => {
  const { t } = useTranslation()
  const selectContactByAddress = useMemo(makeSelectContactByAddress, [])
  const contact = useAppSelector((s) => selectContactByAddress(s, toAddressHash))
  const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  return (
    <Box className={className}>
      <AddressRow>
        <AddressLabel>{t('From')}</AddressLabel>
        <AddressLabelHash>
          <AddressBadge addressHash={fromAddress.hash} truncate appendHash />
        </AddressLabelHash>
      </AddressRow>
      {toAddressHash && (
        <>
          <HorizontalDivider />
          <AddressRow>
            <AddressLabel>{t('To')}</AddressLabel>
            <AddressLabelHash>
              {contact ? (
                <AddressLabelHash>
                  <ContactName>{contact.name}</ContactName>
                  <HashEllipsedStyled hash={contact.address} />
                </AddressLabelHash>
              ) : (
                <ActionLinkStyled onClick={() => openInWebBrowser(`${explorerUrl}/addresses/${toAddressHash}`)}>
                  <AddressBadge addressHash={toAddressHash} truncate appendHash />
                </ActionLinkStyled>
              )}
            </AddressLabelHash>
          </AddressRow>
        </>
      )}
    </Box>
  )
}

export default CheckAddressesBox

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 15px;
  gap: 20px;
`

const AddressLabel = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`

const AddressLabelHash = styled.div`
  display: flex;
  gap: 10px;
`

const ContactName = styled(Truncate)`
  max-width: 200px;
`

const HashEllipsedStyled = styled(HashEllipsed)`
  max-width: 150px;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 12px;
`

const ActionLinkStyled = styled(ActionLink)`
  font-weight: var(--fontWeight-semiBold);
`
