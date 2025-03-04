import { AddressHash } from '@alephium/shared'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { OptionItem, OptionSelect } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import SkeletonLoader from '@/components/SkeletonLoader'
import ForgetMulitpleAddressesButton from '@/features/addressDeletion/ForgetMulitpleAddressesButton'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesSortedByLastUseWithLatestTx } from '@/hooks/useAddresses'
import CenteredModal, { ModalFooterButton, ModalFooterButtons, ScrollableModalContent } from '@/modals/CenteredModal'
import AddressLastActivity from '@/pages/unlockedWallet/addressesPage/addressListRow/AddressLastActivity'
import { selectDefaultAddress, selectInitialAddress } from '@/storage/addresses/addressesSelectors'

const DeleteAddressesModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const { data: sortedAddresses, isLoading: isLoadingSortedAddresses } =
    useFetchAddressesHashesSortedByLastUseWithLatestTx()
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const initialAddress = useAppSelector(selectInitialAddress)
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
    // eslint-disable-next-line react-compiler/react-compiler
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
    <CenteredModal title={t('forgetAddress_other')} id={id} noPadding>
      <ScrollableModalContent>
        {reversedAddressesArray.length === 1 && (
          <InfoBox importance="accent">{t('You only have one address. You cannot forget it.')}</InfoBox>
        )}

        {reversedAddressesArray.length > 1 && (
          <>
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
                if (addressHash === defaultAddressHash || addressHash === initialAddress?.hash) return

                const isSelected = selectedAddressesForDeletion.some((hash) => hash === addressHash)

                return (
                  <OptionItemStyled
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
                      subtitle={<AddressLastActivity addressHash={addressHash} />}
                    />
                  </OptionItemStyled>
                )
              })}
            </OptionSelect>
          </>
        )}
      </ScrollableModalContent>

      <ModalFooterButtonsStyled>
        <ModalFooterButton role="secondary" onClick={handleCancelClick}>
          {t('Cancel')}
        </ModalFooterButton>

        <ForgetMulitpleAddressesButton
          addressHashes={selectedAddressesForDeletion}
          isLoading={isLoadingSortedAddresses}
          modalId={id}
        />
      </ModalFooterButtonsStyled>
    </CenteredModal>
  )
})

export default DeleteAddressesModal

const ModalFooterButtonsStyled = styled(ModalFooterButtons)`
  margin: var(--spacing-2) var(--spacing-6);
`

const OptionItemStyled = styled(OptionItem)`
  margin-left: 0;
  margin-right: 0;
`
