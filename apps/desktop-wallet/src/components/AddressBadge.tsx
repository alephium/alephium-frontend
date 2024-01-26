/*
Copyright 2018 - 2023 The Alephium Authors
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
  $truncate?: boolean
  $withBorders?: boolean
  hideStar?: boolean
  hideColorIndication?: boolean
  disableA11y?: boolean
  disableCopy?: boolean
  appendHash?: boolean
  displayHashUnder?: boolean
  showFull?: boolean
  className?: string
}

const AddressBadge = ({
  addressHash,
  hideStar,
  className,
  hideColorIndication,
  disableA11y = false,
  disableCopy,
  $truncate,
  appendHash = false,
  displayHashUnder = false,
  $withBorders
}: AddressBadgeProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectContactByAddress = useMemo(makeSelectContactByAddress, [])
  const contact = useAppSelector((s) => selectContactByAddress(s, addressHash))

  return (
    <AddressBadgeStyled
      className={className}
      $withBorders={contact || address ? $withBorders : false}
      $truncate={$truncate}
    >
      {contact ? (
        <Label $truncate={$truncate}>
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
              <Label $truncate={$truncate}>
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

const AddressBadgeStyled = styled.div<Pick<AddressBadgeProps, '$withBorders' | '$truncate'>>`
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ $withBorders }) =>
    $withBorders &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: 25px;
      padding: 5px 10px;
    `}

  ${({ $truncate }) =>
    $truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

const Label = styled.span<Pick<AddressBadgeProps, '$truncate'>>`
  margin-right: 2px;
  white-space: nowrap;
  max-width: 125px;

  ${({ $truncate }) =>
    $truncate &&
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
