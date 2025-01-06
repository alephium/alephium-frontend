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
