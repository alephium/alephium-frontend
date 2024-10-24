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
import InfoBox from '@/components/InfoBox'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLockTimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CallContractTxData, CheckTxProps } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'

const CallContractCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<CallContractTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)

  return (
    <>
      <CheckModalContent>
        {data.assetAmounts && <CheckAmountsBox assetAmounts={data.assetAmounts} />}
        {data.assetAmounts && <CheckWorthBox assetAmounts={data.assetAmounts} />}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        <CheckFeeLockTimeBox fee={fees} />
        <InfoBox label={t('Bytecode')} text={data.bytecode} wordBreak />
      </CheckModalContent>
      <FooterButton onClick={onSubmit} variant={settings.passwordRequirement ? 'default' : 'valid'}>
        {t(settings.passwordRequirement ? 'Confirm' : 'Send')}
      </FooterButton>
    </>
  )
}

export default CallContractCheckTxModalContent
