import { fromHumanReadableAmount } from '@alephium/shared'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import useAnalytics from '@/features/analytics/useAnalytics'
import GasSettings from '@/features/send/GasSettings'
import { CallContractTxData, CallContractTxModalData, TxPreparation } from '@/features/send/sendTypes'
import { isAmountWithinRange } from '@/features/send/sendUtils'
import TokensAmountInputs from '@/features/send/TokensAmountInputs'
import useAreAmountsWithinAddressAvailableBalances from '@/features/send/useAreAmountsWithinAddressAvailableBalances'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { AssetAmountInputType } from '@/types/assets'

interface CallContractBuildTxModalContentProps {
  data: CallContractTxModalData
  onSubmit: (data: CallContractTxData) => void
  onCancel: () => void
  onBack: () => void
}

const CallContractBuildTxModalContent = ({
  data,
  onSubmit,
  onCancel,
  onBack
}: CallContractBuildTxModalContentProps) => {
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
  const { sendAnalytics } = useAnalytics()

  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? ''
  })

  const { fromAddress, bytecode, alphAmount } = txPrep
  const { data: addressAlphBalances } = useFetchAddressBalancesAlph({ addressHash: fromAddress.hash })
  const availableBalance = addressAlphBalances?.availableBalance ?? BigInt(0)

  const [assetAmounts, setAssetAmounts] = useState<AssetAmountInputType[] | undefined>(data.assetAmounts)
  const [isAmountValid, setIsAmountValid] = useState(false)

  const allAssetAmountsAreWithinAvailableBalance = useAreAmountsWithinAddressAvailableBalances(
    fromAddress.hash,
    assetAmounts ?? []
  )

  useEffect(() => {
    try {
      setIsAmountValid(
        !alphAmount || isAmountWithinRange(fromHumanReadableAmount(alphAmount), BigInt(availableBalance))
      )
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not determine if amount is valid' })
    }
  }, [alphAmount, availableBalance, sendAnalytics])

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive =
    !gasPriceError && !gasAmountError && !!bytecode && isAmountValid && allAssetAmountsAreWithinAvailableBalance

  return (
    <>
      <InputFieldsColumn>
        {assetAmounts && (
          <TokensAmountInputs
            address={fromAddress}
            assetAmounts={assetAmounts}
            onTokenAmountsChange={setAssetAmounts}
            id="asset-amounts"
          />
        )}
        <Input
          id="code"
          label={t('Bytecode')}
          value={bytecode}
          onChange={(e) => setTxPrepProp('bytecode')(e.target.value)}
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
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onBack}>
          {t('Back')}
        </ModalFooterButton>
        <ModalFooterButton
          onClick={() =>
            onSubmit({
              fromAddress,
              bytecode: bytecode ?? '',
              assetAmounts,
              gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
              gasPrice
            })
          }
          disabled={!isSubmitButtonActive}
        >
          {t('Check')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default CallContractBuildTxModalContent

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 20px 0;
`
