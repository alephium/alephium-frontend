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

import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import { openModal } from '@/features/modals/modalActions'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLocktimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const TransferCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<TransferTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)
  const dispatch = useAppDispatch()

  const handleButtonPress = () => {
    data.lockTime
      ? dispatch(openModal({ name: 'ConfirmLockTimeModal', props: { lockTime: data.lockTime, onSubmit } }))
      : onSubmit()
  }

  return (
    <>
      <CheckModalContent>
        <CheckAmountsBox assetAmounts={data.assetAmounts} />
        <CheckAddressesBox fromAddress={data.fromAddress} toAddressHash={data.toAddress} />
        <CheckFeeLocktimeBox fee={fees} lockTime={data.lockTime} />
      </CheckModalContent>
      <FooterButton onClick={handleButtonPress}>{t(settings.passwordRequirement ? 'Confirm' : 'Send')}</FooterButton>
    </>
  )
}

export default TransferCheckTxModalContent
