import { addressFromPublicKey, isValidAddress } from '@alephium/web3'
import { motion } from 'framer-motion'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiSearchLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useSnackbar } from '@/hooks/useSnackbar'
import { checkHexStringValidity } from '@/utils/strings'

interface SearchBarProps {
  className?: string
}

const SearchBar = ({ className }: SearchBarProps) => {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)
  const [search, setSearch] = useState('')
  const { displaySnackbar } = useSnackbar()

  const inputRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()

  const handleInputClick = () => setActive(true)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchClick = () => searching(search)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searching(search)
    }
  }

  const handleRemoveFocus = () => {
    setActive(false)
  }

  const cleanSearch = () => {
    setSearch('')
    setActive(false)
  }

  const redirect = (to: string) => {
    handleRemoveFocus()
    cleanSearch()
    inputRef.current?.blur()
    navigate(to)
  }

  const searching = (str: string) => {
    const word = str.trim()

    const isHexString = checkHexStringValidity(word)

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
          redirect(`/addresses/${addressHash}`)
        } else {
          displaySnackbar({ text: t('There seems to be an error in the public key format.'), type: 'info' })
        }
      } else {
        displaySnackbar({ text: t('There seems to be an error in the hash format.'), type: 'info' })
      }
    } else {
      if (isValidAddress(word)) {
        redirect(`/addresses/${word}`)
      } else {
        displaySnackbar({ text: t('There seems to be an error in the address format.'), type: 'info' })
      }
    }
  }

  return (
    <motion.div className={className} layoutId="searchBar">
      <SearchInput
        ref={inputRef}
        onBlur={handleRemoveFocus}
        onChange={handleSearchChange}
        value={search}
        onClick={handleInputClick}
        onKeyDown={handleSearchKeyDown}
        placeholder={t('Search for an address, a public key, or a tx...')}
      />
      {active && <Backdrop animate={{ opacity: 1 }} transition={{ duration: 0.15 }} />}
      <SearchIcon onClick={handleSearchClick} />
    </motion.div>
  )
}

export default styled(SearchBar)`
  position: relative;
  height: 46px;
`

const SearchIcon = styled(RiSearchLine)`
  color: ${({ theme }) => theme.font.primary};
  position: absolute;
  right: 20px;
  top: 13px;
  z-index: 11;
  height: 21px;
  cursor: pointer;
`

const SearchInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50px;
  padding: 0 50px 0 20px;
  color: ${({ theme }) => theme.font.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  border: none;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.02);
  z-index: 10;

  &:focus,
  &:active {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.global.accent};
    z-index: 10;
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
