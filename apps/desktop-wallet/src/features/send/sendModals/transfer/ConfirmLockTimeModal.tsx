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

import dayjs from 'dayjs'
import { LockIcon } from 'lucide-react'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
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
    <CenteredModal title={t('Confirm lock time')} id={id}>
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
      <FooterButton onClick={handleConfirmClick} variant="valid">
        {t('Send locked assets')}
      </FooterButton>
    </CenteredModal>
  )
})

export default ConfirmLockTimeModal

const FromNow = styled.strong`
  color: ${({ theme }) => theme.global.accent};
`
