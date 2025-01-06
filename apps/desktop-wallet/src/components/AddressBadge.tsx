import { AddressHash } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import AddressColorIndicator from '@/components/AddressColorIndicator'
import ClipboardButton from '@/components/Buttons/ClipboardButton'
import HashEllipsed from '@/components/HashEllipsed'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectContactByAddress, selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface AddressBadgeProps {
  addressHash: AddressHash
  truncate?: boolean
  withBorders?: boolean
  hideStar?: boolean
  hideColorIndication?: boolean
  disableA11y?: boolean
  disableCopy?: boolean
  appendHash?: boolean
  displayHashUnder?: boolean
  isShort?: boolean
  className?: string
}

const AddressBadge = ({
  addressHash,
  hideStar,
  className,
  hideColorIndication,
  disableA11y = false,
  disableCopy,
  truncate,
  appendHash = false,
  displayHashUnder = false,
  isShort,
  withBorders
}: AddressBadgeProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectContactByAddress = useMemo(makeSelectContactByAddress, [])
  const contact = useAppSelector((s) => selectContactByAddress(s, addressHash))

  return (
    <AddressBadgeStyled
      className={className}
      withBorders={contact || address ? withBorders : false}
      truncate={truncate}
      isShort={isShort}
    >
      {contact ? (
        <Label truncate={truncate}>
          {disableCopy ? (
            contact.name
          ) : (
            <ClipboardButton textToCopy={contact.address} tooltip={t('Copy contact address')} disableA11y={disableA11y}>
              {contact.name}
            </ClipboardButton>
          )}
        </Label>
      ) : !address ? (
        <NotKnownAddress hash={addressHash} disableCopy={disableCopy} />
      ) : (
        <>
          {!hideColorIndication && <AddressColorIndicator addressHash={address.hash} hideMainAddressBadge={hideStar} />}
          {address.label ? (
            <LabelAndHash isColumn={displayHashUnder}>
              <Label truncate={truncate}>
                {disableCopy || appendHash ? (
                  address.label
                ) : (
                  <ClipboardButton textToCopy={address.hash} tooltip={t('Copy address')} disableA11y={disableA11y}>
                    {address.label}
                  </ClipboardButton>
                )}
              </Label>
              {appendHash && (
                <ShortHashEllipsed hash={address.hash} disableA11y={disableA11y} disableCopy={disableCopy} />
              )}
            </LabelAndHash>
          ) : (
            <HashEllipsed hash={address.hash} disableA11y={disableA11y} disableCopy={disableCopy} />
          )}
        </>
      )}
    </AddressBadgeStyled>
  )
}

export default AddressBadge

const AddressBadgeStyled = styled.div<Pick<AddressBadgeProps, 'withBorders' | 'truncate' | 'isShort'>>`
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ withBorders }) =>
    withBorders &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: 25px;
      padding: 4px 10px;
      background: ${({ theme }) => theme.bg.highlight};
    `}

  ${({ truncate }) =>
    truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}

    ${({ isShort }) =>
    isShort &&
    css`
      max-width: 220px;
    `}
`

const LabelAndHash = styled.div<{ isColumn: boolean }>`
  display: flex;
  overflow: auto;
  gap: 10px;

  ${({ isColumn }) =>
    isColumn &&
    css`
      flex-direction: column;
      gap: 0px;
    `}
`

const Label = styled.span<Pick<AddressBadgeProps, 'truncate'>>`
  margin-right: 2px;
  white-space: nowrap;
  max-width: 125px;

  ${({ truncate }) =>
    truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`

const NotKnownAddress = styled(HashEllipsed)``

const ShortHashEllipsed = styled(HashEllipsed)`
  max-width: 150px;
  min-width: 80px;
  font-size: 12px;
  color: ${({ theme }) => theme.font.secondary};
  width: 100%;
`
