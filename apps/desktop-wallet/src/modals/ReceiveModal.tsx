import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressSelect from '@/components/Inputs/AddressSelect'
import QRCode from '@/components/QRCode'
import { AddressModalProps } from '@/features/modals/modalTypes'
import { useFetchAddressesHashesSortedByLastUse } from '@/hooks/useAddresses'
import CenteredModal from '@/modals/CenteredModal'

const QRCodeSize = 250

const ReceiveModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()
  const { data: allAddressHashes } = useFetchAddressesHashesSortedByLastUse()

  const [selectedAddress, setSelectedAddress] = useState(addressHash)

  return (
    <CenteredModal title={t('Receive')} id={id}>
      <Content>
        <AddressSelect
          label={t('Address')}
          title={t('Select the address to receive funds to.')}
          addressOptions={allAddressHashes}
          selectedAddress={selectedAddress}
          onAddressChange={setSelectedAddress}
          id="address"
          noMargin
        />
        <QRCodeSection>
          {selectedAddress && <QRCode value={selectedAddress} size={QRCodeSize} copyButtonLabel={t('Copy address')} />}
        </QRCodeSection>
      </Content>
    </CenteredModal>
  )
})

export default ReceiveModal

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
`

const QRCodeSection = styled.div`
  display: flex;
  justify-content: center;
`
