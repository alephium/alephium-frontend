/*
Copyright 2018 - 2024 The Alephium Authors
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
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { OptionItem, OptionSelect } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import SkeletonLoader from '@/components/SkeletonLoader'
import ForgetMulitpleAddressesButton from '@/features/addressDeletion/ForgetMulitpleAddressesButton'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchSortedAddressesHashesWithLatestTx } from '@/hooks/useAddresses'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import AddressLastActivity from '@/pages/UnlockedWallet/AddressesPage/addressListRow/AddressLastActivity'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

const DeleteAddressesModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const { data: sortedAddresses, isLoading: isLoadingSortedAddresses } = useFetchSortedAddressesHashesWithLatestTx()
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const dispatch = useAppDispatch()

  const reversedAddressesArray = useMemo(() => [...sortedAddresses].reverse(), [sortedAddresses])

  const [selectedAddressesForDeletion, setSelectedAddressesForDeletion] = useState<AddressHash[]>([])

  useEffect(() => {
    if (!isLoadingSortedAddresses) {
      const neverUsedAddresses = sortedAddresses
        .filter(({ latestTx }) => latestTx?.timestamp === undefined)
        .map(({ addressHash }) => addressHash)

      setSelectedAddressesForDeletion(neverUsedAddresses)
    }

    // We want to initialize the selected addresses only once, we don't care if txs come in the meantime that will update the data array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingSortedAddresses])

  if (isLoadingSortedAddresses) return <SkeletonLoader height="300px" />

  const handleOptionClick = (addressHash: AddressHash) => {
    setSelectedAddressesForDeletion((prevValue) =>
      prevValue.includes(addressHash) ? prevValue.filter((addr) => addr !== addressHash) : [...prevValue, addressHash]
    )
  }

  const handleCancelClick = () => dispatch(closeModal({ id }))

  return (
    <CenteredModal title={t('Forget addresses')} id={id} hasBottomButtons>
      <InfoBox importance="accent">
        <>
          {t('Forgetting addresses does not delete your assets in them.')}{' '}
          {t(
            'If you choose to forget an address with assets, you can always re-add it to your wallet using the "Discover active addresses" feature.'
          )}
        </>
      </InfoBox>
      <OptionSelect>
        {reversedAddressesArray.map(({ addressHash }) => {
          if (addressHash === defaultAddressHash) return

          const isSelected = selectedAddressesForDeletion.some((hash) => hash === addressHash)

          return (
            <OptionItem
              key={addressHash}
              tabIndex={0}
              role="listitem"
              onClick={() => handleOptionClick(addressHash)}
              selected={isSelected}
              focusable
              aria-label={addressHash}
              hasCustomOptionRender={true}
              isFloating
            >
              <SelectOptionAddress
                addressHash={addressHash}
                isSelected={isSelected}
                subtitle={<AddressLastActivity addressHash={addressHash} />}
              />
            </OptionItem>
          )
        })}
      </OptionSelect>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={handleCancelClick}>
          {t('Cancel')}
        </ModalFooterButton>

        <ForgetMulitpleAddressesButton
          addressHashes={selectedAddressesForDeletion}
          isLoading={isLoadingSortedAddresses}
        />
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default DeleteAddressesModal
