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
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLocktimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import { formatDateForDisplay } from '@/utils/misc'

const TransferCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<TransferTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)

  const [isLockTimeConfirmModalOpen, setIsLockTimeConfirmModalOpen] = useState(false)

  return (
    <>
      <CheckModalContent>
        <CheckAmountsBox assetAmounts={data.assetAmounts} />
        <CheckAddressesBox fromAddress={data.fromAddress} toAddressHash={data.toAddress} />
        <CheckFeeLocktimeBox fee={fees} lockTime={data.lockTime} />
      </CheckModalContent>
      <FooterButton onClick={data.lockTime ? () => setIsLockTimeConfirmModalOpen(true) : onSubmit}>
        {t(settings.passwordRequirement ? 'Confirm' : 'Send')}
      </FooterButton>
      <ModalPortal>
        {isLockTimeConfirmModalOpen && data.lockTime && (
          <CenteredModal title={t('Confirm lock time')} onClose={() => setIsLockTimeConfirmModalOpen(false)}>
            <InfoBox importance="accent" Icon={LockIcon}>
              <Trans
                t={t}
                i18nKey="lockTimeConfirmation"
                values={{
                  datetime: formatDateForDisplay(data.lockTime),
                  inTimeFromNow: dayjs(data.lockTime).fromNow()
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
            <FooterButton onClick={onSubmit} variant="valid">
              {t('Send locked assets')}
            </FooterButton>
          </CenteredModal>
        )}
      </ModalPortal>
    </>
  )
}

export default TransferCheckTxModalContent

const FromNow = styled.strong`
  color: ${({ theme }) => theme.global.accent};
`
