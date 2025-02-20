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
  hashWidth?: number
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
  withBorders,
  hashWidth
}: AddressBadgeProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectContactByAddress = useMemo(makeSelectContactByAddress, [])
  const contact = useAppSelector((s) => selectContactByAddress(s, addressHash))

  return (
    <AddressBadgeStyled
      className={className}
      withBorders={contact || address ? withBorders : false}
      hideColorIndication={hideColorIndication}
      truncate={truncate}
      isShort={isShort}
    >
      {contact ? (
        <Label truncate={truncate}>
          {disableCopy ? (
            contact.name
          ) : (
            <ClipboardButtonStyled
              textToCopy={contact.address}
              tooltip={t('Copy contact address')}
              disableA11y={disableA11y}
            >
              {contact.name}
            </ClipboardButtonStyled>
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
                  <ClipboardButtonStyled
                    textToCopy={address.hash}
                    tooltip={t('Copy address')}
                    disableA11y={disableA11y}
                  >
                    {address.label}
                  </ClipboardButtonStyled>
                )}
              </Label>
              {appendHash && (
                <ShortHashEllipsed
                  hash={address.hash}
                  disableA11y={disableA11y}
                  disableCopy={disableCopy}
                  width={hashWidth}
                />
              )}
            </LabelAndHash>
          ) : (
            <HashEllipsed hash={address.hash} disableA11y={disableA11y} disableCopy={disableCopy} width={hashWidth} />
          )}
        </>
      )}
    </AddressBadgeStyled>
  )
}

export default AddressBadge

type AddressBadgeStyledProps = Pick<AddressBadgeProps, 'withBorders' | 'truncate' | 'isShort' | 'hideColorIndication'>

const AddressBadgeStyled = styled.div<AddressBadgeStyledProps>`
  display: flex;
  position: relative;
  align-items: center;
  text-align: ${({ hideColorIndication }) => (hideColorIndication ? 'left' : 'center')};
  gap: 6px;

  ${({ withBorders }) =>
    withBorders &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: 25px;
      padding: 2px 6px;
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
  position: relative;
  margin-right: 2px;
  white-space: nowrap;
  min-width: 40px;

  ${({ truncate }) =>
    truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`

const NotKnownAddress = styled(HashEllipsed)``

const ShortHashEllipsed = styled(HashEllipsed)`
  min-width: 80px;
  font-size: 12px;
  color: ${({ theme }) => theme.font.secondary};
`

const ClipboardButtonStyled = styled(ClipboardButton)`
  position: absolute;
  right: 6px;
`
