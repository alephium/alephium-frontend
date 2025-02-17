import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import GasSettings from '@/features/send/GasSettings'
import { TransferTxData, TransferTxModalData } from '@/features/send/sendTypes'
import { shouldBuildSweepTransactions } from '@/features/send/sendUtils'
import TokensAmountInputs from '@/features/send/TokensAmountInputs'
import useAreAmountsWithinAddressAvailableBalances from '@/features/send/useAreAmountsWithinAddressAvailableBalances'
import useGasSettings from '@/hooks/useGasSettings'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { AssetAmountInputType } from '@/types/assets'

export interface TransferBuildTxModalContentProps {
  data: TransferTxModalData
  onSubmit: (data: TransferTxData) => void
}

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
  const [assetAmounts, setAssetAmounts] = useState<AssetAmountInputType[]>(
    data.assetAmounts ?? (data.tokenId ? [{ id: data.tokenId }] : [])
  )

  const { fromAddress, toAddress } = data

  const { data: tokensBalances } = useFetchAddressBalances({ addressHash: fromAddress.hash })
  const allAssetAmountsAreWithinAvailableBalance = useAreAmountsWithinAddressAvailableBalances(
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

  const shouldSweep = shouldBuildSweepTransactions(assetAmounts, tokensBalances)

  return (
    <>
      <InputFieldsColumn>
        <TokensAmountInputs
          address={fromAddress}
          assetAmounts={assetAmounts}
          onTokenAmountsChange={setAssetAmounts}
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
      <ModalFooterButtons>
        <ModalFooterButton
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
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default TransferBuildTxModalContent

const HorizontalDividerStyled = styled.div`
  flex: 1;
  margin: 15px 0;
`
