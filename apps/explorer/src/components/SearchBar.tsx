import { getAddressExplorerPagePath } from '@alephium/shared-react'
import { addressFromContractId, addressFromPublicKey, isValidAddress } from '@alephium/web3'
import { motion } from 'framer-motion'
import React, { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiSearchLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useSnackbar } from '@/hooks/useSnackbar'
import { checkHexStringValidity } from '@/utils/strings'

interface SearchBarProps {
  className?: string
}

type SearchType = 'automatic' | 'contractId'

const SearchBar = ({ className }: SearchBarProps) => {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('automatic')
  const [hasContractIdError, setHasContractIdError] = useState(false)
  const { displaySnackbar } = useSnackbar()

  const inputRef = useRef<HTMLInputElement>(null)
  const contractIdErrorId = useId()
  const contractIdError = t('A contract ID must contain exactly 64 hexadecimal characters.')

  const navigate = useNavigate()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setHasContractIdError(false)
  }

  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value as SearchType)
    setHasContractIdError(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    searching(search)
  }

  const handleBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setActive(false)
  }

  const cleanSearch = () => {
    setSearch('')
    setSearchType('automatic')
    setHasContractIdError(false)
    setActive(false)
  }

  const redirect = (to: string) => {
    cleanSearch()
    inputRef.current?.blur()
    navigate(to)
  }

  const searching = (str: string) => {
    const word = str.trim()

    const isHexString = checkHexStringValidity(word)

    if (searchType === 'contractId') {
      if (isHexString && word.length === 64) {
        redirect(getAddressExplorerPagePath(addressFromContractId(word)))
      } else {
        setHasContractIdError(true)
        displaySnackbar({ text: contractIdError, type: 'info' })
      }

      return
    }

    if (isHexString) {
      // Is probably not an address, as an address usually contains at least one non-hex character.
      if (word.length === 64) {
        if (word.slice(0, 4) === '0000') {
          redirect(`/blocks/${word}`)
        } else {
          redirect(`/transactions/${word}`)
        }
      } else if (word.length === 66) {
        const addressHash = addressFromPublicKey(word)

        if (isValidAddress(addressHash)) {
          redirect(getAddressExplorerPagePath(addressHash))
        } else {
          displaySnackbar({ text: t('There seems to be an error in the public key format.'), type: 'info' })
        }
      } else {
        displaySnackbar({ text: t('There seems to be an error in the hash format.'), type: 'info' })
      }
    } else {
      if (isValidAddress(word)) {
        redirect(getAddressExplorerPagePath(word))
      } else {
        displaySnackbar({ text: t('There seems to be an error in the address format.'), type: 'info' })
      }
    }
  }

  return (
    <motion.form
      className={className}
      layoutId="searchBar"
      role="search"
      onSubmit={handleSubmit}
      onFocus={() => setActive(true)}
      onBlur={handleBlur}
    >
      <SearchControls>
        <SearchTypeSelect aria-label={t('Search type')} value={searchType} onChange={handleSearchTypeChange}>
          <option value="automatic">{t('Automatic')}</option>
          <option value="contractId">{t('Contract ID')}</option>
        </SearchTypeSelect>
        <SearchInput
          ref={inputRef}
          onChange={handleSearchChange}
          value={search}
          aria-label={t('Search')}
          aria-invalid={hasContractIdError || undefined}
          aria-describedby={hasContractIdError ? contractIdErrorId : undefined}
          placeholder={
            searchType === 'contractId'
              ? t('Search for a contract ID...')
              : t('Search for an address, a public key, or a tx...')
          }
        />
        <SearchButton type="submit" aria-label={t('Search')}>
          <RiSearchLine aria-hidden="true" size={21} />
        </SearchButton>
      </SearchControls>
      {hasContractIdError && (
        <SearchError id={contractIdErrorId} role="alert">
          {contractIdError}
        </SearchError>
      )}
      {active && <Backdrop animate={{ opacity: 1 }} transition={{ duration: 0.15 }} />}
    </motion.form>
  )
}

export default styled(SearchBar)`
  position: relative;
  height: 46px;
`

const SearchControls = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  border-radius: 50px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.02);
  z-index: 10;

  &:focus-within {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.global.accent};
  }
`

const SearchTypeSelect = styled.select`
  max-width: 45%;
  margin-left: 12px;
  padding: 4px;
  border: none;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
  color: ${({ theme }) => theme.font.primary};
  background-color: ${({ theme }) => theme.bg.primary};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.global.accent};
    outline-offset: 2px;
  }
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 12px;
  color: ${({ theme }) => theme.font.primary};
  background: transparent;
  border: none;
`

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 100%;
  padding: 0 18px;
  border: none;
  border-radius: 50px;
  color: ${({ theme }) => theme.font.primary};
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.global.accent};
    outline-offset: -4px;
  }
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(3px);
  z-index: 9;
  opacity: 0;
`

// The snackbar displays the error visually; keep it associated with the input for screen readers too.
const SearchError = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`
