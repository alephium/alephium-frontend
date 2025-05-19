import { AddressHash, GENESIS_TIMESTAMP, selectAddressIds } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Badge from '@/components/Badge'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { openInWebBrowser } from '@/utils/misc'

interface IOListProps {
  currentAddress: string
  isOut: boolean
  timestamp?: number
  outputs?: e.Output[]
  inputs?: e.Input[]
  linkToExplorer?: boolean
  truncate?: boolean
  disableA11y?: boolean
}

const IOList = ({
  currentAddress,
  isOut,
  outputs,
  inputs,
  timestamp,
  linkToExplorer,
  truncate,
  disableA11y = false
}: IOListProps) => {
  const { t } = useTranslation()
  const internalAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const explorerUrl = useAppSelector((state) => state.network.settings.explorerUrl)
  const dispatch = useAppDispatch()

  const io = (isOut ? outputs : inputs) as Array<e.Output | e.Input> | undefined

  const handleShowAddress = (addressHash: AddressHash) =>
    internalAddressHashes.includes(addressHash)
      ? dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
      : openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  if (io && io.length > 0) {
    const isAllCurrentAddress = io.every((o) => o.address === currentAddress)
    const notCurrentAddresses = _(io.filter((o) => o.address !== currentAddress))
      .map((v) => v.address)
      .filter((v): v is string => v !== undefined)
      .uniq()
      .value()

    const addressHash = isAllCurrentAddress ? currentAddress : notCurrentAddresses[0]
    if (!addressHash) return null

    const extraAddressesText = notCurrentAddresses.length > 1 ? `(+${notCurrentAddresses.length - 1})` : ''

    // There may be a case where a wallet sends funds to the same address, which doesn't
    // make it a change address but a legimitate receiving address.
    const addressesToShow = notCurrentAddresses.length === 0 ? [currentAddress] : notCurrentAddresses

    return truncate ? (
      <TruncateWrap>
        <AddressBadge truncate addressHash={addressHash} disableA11y={disableA11y} withBorders />
        {extraAddressesText && <AddressesHidden>{extraAddressesText}</AddressesHidden>}
      </TruncateWrap>
    ) : (
      <Addresses>
        {addressesToShow.map((addressHash) => {
          const addressComponent = (
            <AddressBadge truncate addressHash={addressHash} disableA11y={disableA11y} withBorders key={addressHash} />
          )
          return linkToExplorer ? (
            <ActionLinkStyled onClick={() => handleShowAddress(addressHash)} key={addressHash}>
              {addressComponent}
            </ActionLinkStyled>
          ) : (
            addressComponent
          )
        })}
      </Addresses>
    )
  } else if (timestamp === GENESIS_TIMESTAMP) {
    return <Badge truncate={truncate}>{t('Genesis TX')}</Badge>
  } else {
    return <Badge truncate={truncate}>{t('Mining Rewards')}</Badge>
  }
}

export default IOList

const TruncateWrap = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  text-align: left;
`

const AddressesHidden = styled.div`
  margin-left: 0.5em;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`

const Addresses = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  overflow: hidden;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: flex-end;
`
