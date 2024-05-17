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

import {
  Asset,
  fromHumanReadableAmount,
  getNumberOfDecimals,
  toHumanReadableAmount,
  tokenIsFungible
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { MoreVertical, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useAddressAssets } from '@/api/apiHooks'
import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Box from '@/components/Box'
import DeleteButton from '@/components/Buttons/DeleteButton'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import HashEllipsed from '@/components/HashEllipsed'
import { inputDefaultStyle, InputProps } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import { SelectContainer, SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAsset from '@/components/Inputs/SelectOptionAsset'
import Truncate from '@/components/Truncate'
import { useMoveFocusOnPreviousModal } from '@/modals/ModalContainer'
import ModalPortal from '@/modals/ModalPortal'
import InputsSection from '@/modals/SendModals/InputsSection'
import { Address } from '@/types/addresses'
import { AssetAmountInputType } from '@/types/assets'
import { onEnterOrSpace } from '@/utils/misc'

interface AssetAmountsInputProps {
  address: Address
  assetAmounts: AssetAmountInputType[]
  onAssetAmountsChange: (assetAmounts: AssetAmountInputType[]) => void
  id: string
  allowMultiple?: boolean
  className?: string
}

const AssetAmountsInput = ({
  address,
  assetAmounts,
  onAssetAmountsChange,
  allowMultiple = true,
  className
}: AssetAmountsInputProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { data: assets = [] } = useAddressAssets(address.hash)

  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const selectedValueRef = useRef<HTMLDivElement>(null)

  const [isAssetSelectModalOpen, setIsAssetSelectModalOpen] = useState(false)
  const [selectedAssetRowIndex, setSelectedAssetRowIndex] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const selectedAssetId = assetAmounts[selectedAssetRowIndex]?.id
  const selectedAsset = assets?.find((asset) => asset.id === selectedAssetId)
  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)
  const selectedAssetIds = assetAmounts.map(({ id }) => id)
  const remainingAvailableAssets = assets.filter(
    (asset) => !selectedAssetIds.includes(asset.id) && asset.balance > BigInt(0)
  )
  const disabled = remainingAvailableAssets.length === 0
  const availableAssetOptions: SelectOption<Asset['id']>[] = remainingAvailableAssets.map((asset) => ({
    value: asset.id,
    label: asset.name || asset.id
  }))
  const canAddMultipleAssets = allowMultiple && assetAmounts.length < assets.length

  const openAssetSelectModal = (assetRowIndex: number) => {
    setSelectedAssetRowIndex(assetRowIndex)
    setIsAssetSelectModalOpen(true)
  }

  const handleAssetSelect = (asset: Asset) => {
    const newAssetAmounts = [...assetAmounts]
    newAssetAmounts.splice(selectedAssetRowIndex, 1, {
      id: asset.id
    })
    onAssetAmountsChange(newAssetAmounts)
  }

  const handleAssetAmountChange = (assetRowIndex: number, amountInput: string) => {
    const selectedAssetId = assetAmounts[assetRowIndex].id
    const selectedAsset = assets.find((asset) => asset.id === selectedAssetId)

    if (!selectedAsset) return

    const cleanedAmount = amountInput === '00' ? '0' : amountInput
    const amountValueAsFloat = parseFloat(cleanedAmount)
    const tooManyDecimals = getNumberOfDecimals(cleanedAmount) > (selectedAsset?.decimals ?? 0)
    const availableAmount = toHumanReadableAmount(
      selectedAsset.balance - selectedAsset.lockedBalance,
      selectedAsset.decimals
    )

    const newError =
      amountValueAsFloat > parseFloat(availableAmount)
        ? t('Amount exceeds available balance')
        : selectedAssetId === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph) && amountValueAsFloat !== 0
          ? t('Amount must be greater than {{ minAmountInAlph }}', { minAmountInAlph })
          : tooManyDecimals
            ? t('This asset cannot have more than {{ decimals }} decimals', { decimals: selectedAsset.decimals })
            : ''
    const newErrors = [...errors]
    newErrors.splice(assetRowIndex, 1, newError)
    setErrors(newErrors)

    const amount = !cleanedAmount ? undefined : fromHumanReadableAmount(cleanedAmount, selectedAsset.decimals)
    const newAssetAmounts = [...assetAmounts]
    newAssetAmounts.splice(assetRowIndex, 1, {
      id: selectedAssetId,
      amount,
      amountInput: cleanedAmount
    })
    onAssetAmountsChange(newAssetAmounts)
  }

  const handleAddAssetClick = () => {
    if (remainingAvailableAssets.length > 0) {
      const newAssetAmounts = [...assetAmounts]
      newAssetAmounts.push({
        id: remainingAvailableAssets[0].id
      })
      onAssetAmountsChange(newAssetAmounts)
    }
  }

  const handleRemoveAssetClick = (index: number) => {
    if (assetAmounts.length > 1) {
      if (selectedAssetRowIndex > index) {
        setSelectedAssetRowIndex(selectedAssetRowIndex - 1)
      }

      const newAssetAmounts = [...assetAmounts]
      newAssetAmounts.splice(index, 1)

      onAssetAmountsChange(newAssetAmounts)
    }
  }

  const handleAssetSelectModalClose = () => {
    setIsAssetSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const handleAssetSelectModalOpen = (index: number) => !disabled && allowMultiple && openAssetSelectModal(index)

  const selectAsset = (option: SelectOption<Asset['id']>) => {
    const asset = remainingAvailableAssets.find((asset) => asset.id === option.value)
    asset && handleAssetSelect(asset)
  }

  useEffect(() => {
    const addressTokenIds = assets.map((token) => token.id)
    const filteredAssetAmounts = assetAmounts.filter(
      (asset) => addressTokenIds.includes(asset.id) || asset.id === ALPH.id
    )

    if (filteredAssetAmounts.length === 0) {
      filteredAssetAmounts.push({ id: ALPH.id })
    }

    setSelectedAssetRowIndex(0)
    onAssetAmountsChange(filteredAssetAmounts)

    // We want to potentially update the list of assets ONLY when the address changes because the newly chosen address
    // might not have the tokens that were selected before
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return (
    <InputsSection
      title={t(assetAmounts.length < 2 ? 'Asset' : 'Assets')}
      HeaderActions={
        canAddMultipleAssets && (
          <AddAssetSection>
            <ActionLink Icon={Plus} onClick={handleAddAssetClick} withBackground iconPosition="left">
              {t('Add asset')}
            </ActionLink>
          </AddAssetSection>
        )
      }
      className={className}
    >
      <AssetAmounts ref={selectedValueRef}>
        {assetAmounts.map(({ id, amountInput = '' }, index) => {
          const asset = assets.filter(tokenIsFungible).find((asset) => asset.id === id)
          if (!asset) return

          const availableAmount = asset.balance - asset.lockedBalance
          const availableHumanReadableAmount = toHumanReadableAmount(availableAmount, asset.decimals)

          return (
            <BoxStyled key={id}>
              <AssetSelect
                onMouseDown={() => handleAssetSelectModalOpen(index)}
                onKeyDown={(e) => onEnterOrSpace(e, () => handleAssetSelectModalOpen(index))}
              >
                <SelectInput
                  className={className}
                  disabled={disabled || !allowMultiple || !canAddMultipleAssets}
                  id={id}
                >
                  <AssetLogo assetId={asset.id} assetImageUrl={asset.logoURI} size={20} assetName={asset.name} />
                  <AssetName>
                    <Truncate>
                      {asset.name ? (
                        `${asset.name} ${asset.symbol ? `(${asset.symbol})` : ''}`
                      ) : (
                        <HashEllipsed hash={asset.id} />
                      )}
                    </Truncate>
                  </AssetName>
                  {canAddMultipleAssets && (
                    <SelectVerticalDots>
                      <MoreVertical size={16} />
                    </SelectVerticalDots>
                  )}
                </SelectInput>
              </AssetSelect>
              <HorizontalDividerStyled />
              <AssetAmountRow>
                <AssetAmountInput
                  value={amountInput}
                  onChange={(e) => handleAssetAmountChange(index, e.target.value)}
                  onClick={() => setSelectedAssetRowIndex(index)}
                  onMouseDown={() => setSelectedAssetRowIndex(index)}
                  onKeyDown={(e) => onEnterOrSpace(e, () => setSelectedAssetRowIndex(index))}
                  type="number"
                  min={asset.id === ALPH.id ? minAmountInAlph : 0}
                  max={availableHumanReadableAmount}
                  aria-label={t('Amount')}
                  label={`${t('Amount')} ${asset.symbol ? `(${asset.symbol})` : ''}`}
                  error={errors[index]}
                />

                <AvailableAmountColumn>
                  <AvailableAmount tabIndex={0}>
                    <Amount
                      value={availableAmount}
                      nbOfDecimalsToShow={4}
                      color={theme.font.secondary}
                      suffix={asset.symbol}
                      decimals={asset.decimals}
                      isUnknownToken={!asset.symbol}
                    />
                    <span> {t('Available').toLowerCase()}</span>
                  </AvailableAmount>
                  <ActionLink onClick={() => handleAssetAmountChange(index, availableHumanReadableAmount)}>
                    {t('Use max amount')}
                  </ActionLink>
                </AvailableAmountColumn>
              </AssetAmountRow>
              {assetAmounts.length > 1 && <DeleteButton onClick={() => handleRemoveAssetClick(index)} />}
            </BoxStyled>
          )
        })}
      </AssetAmounts>
      <ModalPortal>
        {isAssetSelectModalOpen && selectedAsset && remainingAvailableAssets.length > 0 && (
          <SelectOptionsModal
            title={t('Select an asset')}
            options={availableAssetOptions}
            selectedOption={availableAssetOptions.find((option) => option.value === selectedAsset.id)}
            setValue={selectAsset}
            onClose={handleAssetSelectModalClose}
            parentSelectRef={selectedValueRef}
            optionRender={(option) => {
              const asset = remainingAvailableAssets.find((asset) => asset.id === option.value)
              if (asset) return <SelectOptionAsset asset={asset} />
            }}
          />
        )}
      </ModalPortal>
    </InputsSection>
  )
}

export default AssetAmountsInput

const BoxStyled = styled(Box)`
  padding: 5px;
  position: relative;

  &:hover {
    ${DeleteButton} {
      opacity: 1;
    }
  }
`

const AssetSelect = styled(SelectContainer)`
  margin: 0;
`

const SelectInput = styled.button<InputProps>`
  ${({ isValid, Icon }) => inputDefaultStyle(isValid || !!Icon, false, true)};
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  border: 0 !important;
  cursor: ${({ disabled }) => (disabled ? 'cursor' : 'pointer')};

  &:not(:hover) {
    background-color: transparent;
  }
`

const AssetName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 200px;
`

const AssetAmountInput = styled(Input)`
  margin: 0;
  border: 0;

  &:not(:hover) {
    background-color: transparent;
  }
`

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 5px 0;
`

const AssetAmountRow = styled.div`
  position: relative;
`

const AvailableAmountColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  font-size: 11px;
  position: absolute;
  right: 15px;
  top: 0;
  height: 100%;
`

const AvailableAmount = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const AddAssetSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 13px 0;
`

const AssetAmounts = styled.div`
  & > :not(:last-child) {
    margin-bottom: 20px;
  }
`

const SelectVerticalDots = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`
