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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import FooterButton from '@/components/Buttons/FooterButton'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import GasSettings from '@/features/send/GasSettings'
import { DeployContractTxData, DeployContractTxModalData, TxPreparation } from '@/features/send/sendTypes'
import { isAmountWithinRange } from '@/features/send/sendUtils'
import TokensAmountInputs from '@/features/send/TokensAmountInputs'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import { AssetAmountInputType } from '@/types/assets'

export interface DeployContractBuildTxModalContentProps {
  data: DeployContractTxModalData
  onSubmit: (data: DeployContractTxData) => void
  onCancel: () => void
}

const defaultAssetAmount = { id: ALPH.id }

const DeployContractBuildTxModalContent = ({ data, onSubmit, onCancel }: DeployContractBuildTxModalContentProps) => {
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

  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? '',
    issueTokenAmount: data.issueTokenAmount ?? ''
  })
  const [assetAmounts, setAssetAmounts] = useState<AssetAmountInputType[]>([
    data.initialAlphAmount || defaultAssetAmount
  ])
  const alphAsset = assetAmounts[0]

  const { fromAddress, bytecode, issueTokenAmount } = txPrep
  const { data: addressAlphBalances } = useFetchAddressBalancesAlph({ addressHash: fromAddress.hash })
  const availableBalance = addressAlphBalances?.availableBalance ?? BigInt(0)

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    !!bytecode &&
    (!alphAsset.amount || isAmountWithinRange(alphAsset.amount, BigInt(availableBalance)))

  return (
    <>
      <InputFieldsColumn>
        <TokensAmountInputs
          address={fromAddress}
          assetAmounts={assetAmounts}
          onTokenAmountsChange={setAssetAmounts}
          allowMultiple={false}
          id="asset-amounts"
        />
        <Input
          id="code"
          label={t('Bytecode')}
          value={bytecode}
          onChange={(e) => setTxPrepProp('bytecode')(e.target.value)}
        />
        <Input
          id="issue-token-amount"
          label={t('Tokens to issue (optional)')}
          value={issueTokenAmount}
          type="number"
          onChange={(e) => setTxPrepProp('issueTokenAmount')(e.target.value)}
          noMargin
        />
      </InputFieldsColumn>
      <HorizontalDividerStyled />
      <ToggleSection
        title={t('Show advanced options')}
        subtitle={t('Set gas settings')}
        onClick={clearGasSettings}
        isOpen={!!gasAmount || !!gasPrice}
      >
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
            bytecode: bytecode ?? '',
            issueTokenAmount: issueTokenAmount || undefined,
            initialAlphAmount: alphAsset.amount && alphAsset.amount > 0 ? alphAsset : undefined,
            gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice
          })
        }
        disabled={!isSubmitButtonActive}
      >
        {t('Check')}
      </FooterButton>
    </>
  )
}

export default DeployContractBuildTxModalContent

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 20px 0;
`
