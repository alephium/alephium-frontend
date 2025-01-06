import { ADDRESSES_QUERY_LIMIT } from '@alephium/shared'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

const AddressLimitWarning = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleForgetAddressesClick = () => dispatch(openModal({ name: 'DeleteAddressesModal' }))

  return (
    <InfoBox Icon={AlertTriangle} importance="warning">
      <Contents>
        <span>
          {t(
            'Your wallet has too many addresses. These are the transactions of the {{ maxNumber }} most frequently used addresses. Please, consider removing some of them.',
            { maxNumber: ADDRESSES_QUERY_LIMIT }
          )}
        </span>
        <Button short onClick={handleForgetAddressesClick}>
          {t('forgetAddress_other')}
        </Button>
      </Contents>
    </InfoBox>
  )
}

export default AddressLimitWarning

const Contents = styled.div`
  display: flex;
  gap: 30px;
  justify-content: space-between;
  align-items: center;
`
