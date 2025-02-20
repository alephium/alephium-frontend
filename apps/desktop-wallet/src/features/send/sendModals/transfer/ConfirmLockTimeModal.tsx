import dayjs from 'dayjs'
import { LockIcon } from 'lucide-react'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { formatDateForDisplay } from '@/utils/misc'

export type ConfirmLockTimeModalProps = Required<Pick<TransferTxData, 'lockTime'>> &
  Pick<CheckTxProps<TransferTxData>, 'onSubmit'>

const ConfirmLockTimeModal = memo(({ id, lockTime, onSubmit }: ModalBaseProp & ConfirmLockTimeModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleConfirmClick = () => {
    onSubmit()
    dispatch(closeModal({ id }))
  }

  return (
    <CenteredModal title={t('Confirm lock time')} id={id} hasFooterButtons dynamicContent>
      <InfoBox importance="accent" Icon={LockIcon}>
        <Trans
          t={t}
          i18nKey="lockTimeConfirmation"
          values={{
            datetime: formatDateForDisplay(lockTime),
            inTimeFromNow: dayjs(lockTime).fromNow()
          }}
          components={{
            1: <strong />,
            3: <FromNow />
          }}
        >
          {
            'You chose to lock the assets until <1>{{ datetime }}</1>. That is approximately <3>{{ inTimeFromNow }}</3> from now. Are you sure you want to lock the assets until then?'
          }
        </Trans>
      </InfoBox>
      <ModalFooterButtons>
        <ModalFooterButton onClick={handleConfirmClick} variant="valid">
          {t('Send locked assets')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default ConfirmLockTimeModal

const FromNow = styled.strong`
  color: ${({ theme }) => theme.global.accent};
`
