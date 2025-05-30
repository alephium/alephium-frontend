import {
  Address,
  AddressHash,
  fromHumanReadableAmount,
  getNumberOfDecimals,
  toHumanReadableAmount
} from '@alephium/shared'
import {
  addressTokensSearchStringsQuery,
  useCurrentlyOnlineNetworkId,
  useFetchAddressBalances,
  useFetchAddressFtsSorted,
  useFetchAddressFtsUnsorted,
  useFetchAddressTokensByType,
  useSortedTokenIds
} from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Button from '@/components/Button'
import DeleteButton from '@/components/Buttons/DeleteButton'
import { inputDefaultStyle, InputProps } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import { SelectOption, SelectOptionsModal, SelectOutterContainer } from '@/components/Inputs/Select'
import SelectMoreIcon from '@/components/Inputs/SelectMoreIcon'
import SelectOptionTokenName from '@/components/Inputs/SelectOptionTokenName'
import Truncate from '@/components/Truncate'
import InputsSection from '@/features/send/InputsSection'
import SelectOptionAddressToken from '@/features/send/SelectOptionAddressToken'
import { useMoveFocusOnPreviousModal } from '@/modals/ModalContainer'
import ModalPortal from '@/modals/ModalPortal'
import { AssetAmountInputType } from '@/types/assets'
import { onEnterOrSpace } from '@/utils/misc'

interface TokensAmountInputsProps {
  address: Address // TODO: Change to AddressHash
  assetAmounts: AssetAmountInputType[]
  onTokenAmountsChange: (assetAmounts: AssetAmountInputType[]) => void
  id: string
  allowMultiple?: boolean
  className?: string
}

const TokensAmountInputs = ({
  address,
  assetAmounts,
  onTokenAmountsChange,
  allowMultiple = true,
  className
}: TokensAmountInputsProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const selectedValueRef = useRef<HTMLDivElement>(null)
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchAddressBalances(address.hash)

  const { data: fts } = useFetchAddressFtsUnsorted(address.hash)
  const {
    data: { nftIds }
  } = useFetchAddressTokensByType(address.hash)

  const allTokensOptions = useAddressTokensSelectOptions(address.hash)

  const [isAssetSelectModalOpen, setIsTokenSelectModalOpen] = useState(false)
  const [selectedTokenRowIndex, setSelectedTokenRowIndex] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const selectedTokenId = assetAmounts[selectedTokenRowIndex]?.id
  const selectedOption = allTokensOptions.find((option) => option.value === selectedTokenId)
  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)
  const selectedAssetIds = assetAmounts.map(({ id }) => id)
  const remainingAvailableAssetsOptions = allTokensOptions.filter((option) => !selectedAssetIds.includes(option.value))
  const disabled = remainingAvailableAssetsOptions.length === 0
  const canAddMultipleAssets = allowMultiple && assetAmounts.length < allTokensOptions.length
  const shouldDisplayAssetSelectModal =
    assetAmounts.length === 0 || (isAssetSelectModalOpen && !!selectedOption && !disabled)

  const handleOpenAddressTokensSelectModal = useCallback((tokenRowIndex: number) => {
    setSelectedTokenRowIndex(tokenRowIndex)
    setIsTokenSelectModalOpen(true)
  }, [])

  const handleAssetSelect = (id: string) => {
    const newTokenAmounts = [...assetAmounts]

    newTokenAmounts.splice(selectedTokenRowIndex, 1, {
      id,
      amount: nftIds.includes(id) ? BigInt(1) : undefined
    })

    const newErrors = [...errors]
    newErrors.splice(selectedTokenRowIndex, 1, '')
    setErrors(newErrors)

    onTokenAmountsChange(newTokenAmounts)
  }

  const handleTokenAmountChange = useCallback(
    (tokenRowIndex: number, amountInput: string) => {
      const selectedTokenId = assetAmounts[tokenRowIndex].id
      const selectedTokenBalances = tokensBalances?.find(({ id }) => selectedTokenId === id)

      if (!selectedTokenBalances || nftIds.includes(selectedTokenId)) return

      const cleanedAmount = amountInput === '00' ? '0' : amountInput
      const amountValueAsFloat = parseFloat(cleanedAmount)

      const ft = fts.find(({ id }) => selectedTokenId === id)
      const availableAmount = toHumanReadableAmount(
        BigInt(selectedTokenBalances.availableBalance ?? 0),
        ft?.decimals ?? 0
      )

      const newError =
        amountValueAsFloat > parseFloat(availableAmount)
          ? t('Amount exceeds available balance')
          : selectedTokenId === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph) && amountValueAsFloat !== 0
            ? t('Amount must be greater than {{ minAmountInAlph }}', { minAmountInAlph })
            : ft && getNumberOfDecimals(cleanedAmount) > ft.decimals
              ? t('This asset cannot have more than {{ decimals }} decimals', { decimals: ft.decimals })
              : ''

      const newErrors = [...errors]
      newErrors.splice(tokenRowIndex, 1, newError)
      setErrors(newErrors)

      const amount = !cleanedAmount ? undefined : fromHumanReadableAmount(cleanedAmount, ft?.decimals ?? 0)
      const newTokenAmounts = [...assetAmounts]
      newTokenAmounts.splice(tokenRowIndex, 1, {
        id: selectedTokenId,
        amount,
        amountInput: cleanedAmount
      })
      onTokenAmountsChange(newTokenAmounts)
    },
    [assetAmounts, errors, minAmountInAlph, nftIds, onTokenAmountsChange, fts, t, tokensBalances]
  )

  const handleAddAssetClick = () => {
    if (remainingAvailableAssetsOptions.length > 0) {
      const newTokenAmounts = [...assetAmounts]
      newTokenAmounts.push({
        id: remainingAvailableAssetsOptions[0].value
      })
      onTokenAmountsChange(newTokenAmounts)
    }
  }

  const handleRemoveAssetClick = (index: number) => {
    if (assetAmounts.length > 1) {
      if (selectedTokenRowIndex > index) {
        setSelectedTokenRowIndex(selectedTokenRowIndex - 1)
      }

      const newTokenAmounts = [...assetAmounts]
      newTokenAmounts.splice(index, 1)

      onTokenAmountsChange(newTokenAmounts)
    }
  }

  const handleAssetSelectModalClose = () => {
    setIsTokenSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const selectAsset = (option: SelectOption<string>) => {
    handleAssetSelect(option.value)
  }

  const renderOption = (option: SelectOption<string>) => {
    const token = tokensBalances?.find((token) => token.id === option.value)
    return token && <SelectOptionAddressToken tokenId={token.id} addressHash={address.hash} />
  }

  return (
    <>
      <InputsSection className={className}>
        <AssetAmounts ref={selectedValueRef}>
          {assetAmounts.map(({ id, amountInput = '' }, index) => {
            const tokenBalances = tokensBalances?.find((token) => token.id === id)

            const ft = fts.find((token) => token.id === id)

            // TODO: If ALPH, subtract dust for each other token, possibly by querying the node `/addresses/{address}/utxos`
            const availableHumanReadableAmount = toHumanReadableAmount(
              BigInt(tokenBalances?.availableBalance ?? 0),
              ft?.decimals ?? 0
            )

            return (
              <SelectContainer key={id}>
                <AssetSelect
                  onMouseDown={() => handleOpenAddressTokensSelectModal(index)}
                  onKeyDown={(e) => onEnterOrSpace(e, () => handleOpenAddressTokensSelectModal(index))}
                >
                  <SelectInput
                    className={className}
                    disabled={disabled || !allowMultiple || !canAddMultipleAssets}
                    id={id}
                  >
                    <AssetLogo tokenId={id} size={20} />
                    <AssetName>
                      <Truncate>
                        <SelectOptionTokenName tokenId={id} />
                      </Truncate>
                    </AssetName>
                    {!disabled && <SelectMoreIcon />}
                  </SelectInput>
                </AssetSelect>

                {!nftIds.includes(id) && (
                  <AssetAmountContainer>
                    <AssetAmountInput
                      value={amountInput}
                      onChange={(e) => handleTokenAmountChange(index, e.target.value)}
                      onClick={() => setSelectedTokenRowIndex(index)}
                      onMouseDown={() => setSelectedTokenRowIndex(index)}
                      onKeyDown={(e) => onEnterOrSpace(e, () => setSelectedTokenRowIndex(index))}
                      type="number"
                      min={id === ALPH.id ? minAmountInAlph : 0}
                      max={availableHumanReadableAmount}
                      aria-label={t('Amount')}
                      placeholder={`${t('Amount')} ${ft ? `(${ft.symbol})` : ''}`}
                      error={errors[index]}
                      autoFocus
                      largeText
                    />

                    <AvailableAmountColumn>
                      <AvailableAmount tabIndex={0}>
                        {tokenBalances && (
                          <Amount
                            tokenId={id}
                            value={BigInt(tokenBalances.availableBalance)}
                            nbOfDecimalsToShow={4}
                            color={theme.font.secondary}
                            isLoading={isLoadingTokensBalances}
                          />
                        )}
                      </AvailableAmount>
                      <ActionLink onClick={() => handleTokenAmountChange(index, availableHumanReadableAmount)}>
                        {t('use_max_amount')}
                      </ActionLink>
                    </AvailableAmountColumn>
                  </AssetAmountContainer>
                )}
                {assetAmounts.length > 1 && <DeleteButton onClick={() => handleRemoveAssetClick(index)} />}
              </SelectContainer>
            )
          })}
        </AssetAmounts>
        <ModalPortal>
          {shouldDisplayAssetSelectModal && (
            <SelectOptionsModal
              title={t('Asset to send')}
              options={remainingAvailableAssetsOptions}
              selectedOption={selectedOption}
              setValue={selectAsset}
              onClose={handleAssetSelectModalClose}
              parentSelectRef={selectedValueRef}
              optionRender={renderOption}
              isSearchable={remainingAvailableAssetsOptions.length > 5}
            />
          )}
        </ModalPortal>
      </InputsSection>
      {canAddMultipleAssets && (
        <AddAssetSection>
          <Button Icon={Plus} onClick={handleAddAssetClick} role="secondary" short>
            {t('Add asset')}
          </Button>
        </AddAssetSection>
      )}
    </>
  )
}

export default TokensAmountInputs

const useAddressTokensSelectOptions = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()
  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)
  const {
    data: { nftIds, nstIds }
  } = useFetchAddressTokensByType(addressHash)
  const sortedTokenIds = useSortedTokenIds({ sortedFts, nftIds, nstIds })

  const { data: tokensSearchStrings } = useQuery(addressTokensSearchStringsQuery({ addressHash, networkId }))

  const allTokensOptions = useMemo(
    () =>
      sortedTokenIds.map((id) => ({
        value: id,
        label: id,
        searchString: tokensSearchStrings?.[id] ?? ''
      })),
    [sortedTokenIds, tokensSearchStrings]
  )

  return allTokensOptions
}

const AddAssetSection = styled.div`
  display: flex;
  margin: 13px 0;
`

const AssetAmounts = styled.div`
  & > :not(:last-child) {
    margin-bottom: 20px;
  }
`

const SelectContainer = styled.div`
  padding: 5px;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-medium);

  &:hover {
    ${DeleteButton} {
      opacity: 1;
    }
  }
`

const AssetSelect = styled(SelectOutterContainer)`
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
  font-weight: var(--fontWeight-semiBold);

  &:not(:hover) {
    background-color: transparent;
  }
`

const AssetAmountContainer = styled.div`
  position: relative;
  display: flex;
`

const AvailableAmountColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  font-size: 11px;
  flex-shrink: 0;
  height: 100%;
  padding: 0 var(--spacing-2);
`

const AvailableAmount = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`
