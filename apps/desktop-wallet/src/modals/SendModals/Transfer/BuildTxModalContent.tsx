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

import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesTotalTokensBalances } from '@/api/addressesBalancesDataHooks'
import FooterButton from '@/components/Buttons/FooterButton'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import useGasSettings from '@/hooks/useGasSettings'
import AssetAmountsInput from '@/modals/SendModals/AssetAmountsInput'
import GasSettings from '@/modals/SendModals/GasSettings'
import useAreAmountsWithinAvailableBalance from '@/modals/SendModals/useAreAmountsWithinAvailableBalance'
import { AssetAmountInputType } from '@/types/assets'
import { PartialTxData, TransferTxData } from '@/types/transactions'

export interface TransferBuildTxModalContentProps {
  data: PartialTxData<TransferTxData, 'fromAddress'>
  onSubmit: (data: TransferTxData) => void
}

const defaultAssetAmounts = [{ id: ALPH.id }]

const TransferBuildTxModalContent = ({ data, onSubmit }: TransferBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const {
    gasAmount,
    gasAmountError,
    gasPrice,
    gasPriceError,
    clearGasSettings,
    handleGasAmountChange,
    handleGasPriceChange
  } = useGasSettings(data?.gasAmount?.toString(), data?.gasPrice)

  const [lockTime, setLockTime] = useState(data.lockTime)
  const [assetAmounts, setAssetAmounts] = useState<AssetAmountInputType[]>(data.assetAmounts || defaultAssetAmounts)

  const { fromAddress, toAddress } = data

  const { data: tokensBalances } = useAddressesTotalTokensBalances(fromAddress.hash)
  const allAssetAmountsAreWithinAvailableBalance = useAreAmountsWithinAvailableBalance(
    fromAddress.hash,
    assetAmounts ?? []
  )

  if (!fromAddress || !toAddress) return null

  const handleLocktimeChange = (lockTimeInput: string) =>
    setLockTime(lockTimeInput ? dayjs(lockTimeInput).toDate() : undefined)

  const clearAdvancedSettings = () => {
    clearGasSettings()
    setLockTime(undefined)
  }

  const lockTimeInPast = lockTime && dayjs(lockTime).toDate() < dayjs().toDate()
  const atLeastOneAssetWithAmountIsSet = assetAmounts.some((asset) => asset?.amount && asset.amount > 0)

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    !!toAddress &&
    !lockTimeInPast &&
    atLeastOneAssetWithAmountIsSet &&
    allAssetAmountsAreWithinAvailableBalance

  const shouldSweep = Object.keys(tokensBalances).every((tokenId) => {
    const balances = tokensBalances[tokenId]
    const asset = assetAmounts.find((asset) => asset.id === tokenId)

    return !balances || !balances.balance ? true : !asset ? false : balances.balance === asset.amount
  })

  return (
    <>
      <InputFieldsColumn>
        <AssetAmountsInput
          address={fromAddress}
          assetAmounts={assetAmounts}
          onAssetAmountsChange={setAssetAmounts}
          id="asset-amounts"
        />
      </InputFieldsColumn>
      <HorizontalDividerStyled />
      <ToggleSection
        title={t('Show advanced options')}
        subtitle={t('Set gas and lock time')}
        onClick={clearAdvancedSettings}
        isOpen={!!lockTime || !!gasAmount || !!gasPrice}
      >
        <Input
          id="locktime"
          label={t('Lock time')}
          value={lockTime ? dayjs(lockTime).format('YYYY-MM-DDTHH:mm') : ''}
          onChange={(e) => handleLocktimeChange(e.target.value)}
          type="datetime-local"
          min={dayjs().format('YYYY-MM-DDTHH:mm')}
          max="2999-01-01T00:00"
          error={lockTimeInPast && t('Lock time must be in the future.')}
          liftLabel
          inputFieldStyle={{
            paddingTop: '15px'
          }}
        />
        <GasSettings
          gasAmount={gasAmount}
          gasAmountError={gasAmountError}
          gasPrice={gasPrice}
          gasPriceError={gasPriceError}
          onGasAmountChange={handleGasAmountChange}
          onGasPriceChange={handleGasPriceChange}
        />
      </ToggleSection>
      <FooterButton
        onClick={() =>
          onSubmit({
            fromAddress,
            toAddress,
            assetAmounts,
            gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice,
            lockTime,
            shouldSweep
          })
        }
        disabled={!isSubmitButtonActive}
      >
        {t('Check')}
      </FooterButton>
    </>
  )
}

export default TransferBuildTxModalContent

const HorizontalDividerStyled = styled.div`
  flex: 1;
  margin: 15px 0;
`
