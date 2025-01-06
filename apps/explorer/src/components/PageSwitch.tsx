import { colord } from 'colord'
import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import TextButton from '@/components/Buttons/TextButton'
import useOnClickOutside from '@/hooks/useOnClickOutside'
import usePageNumber from '@/hooks/usePageNumber'

const manualInputHeight = 30
const defaultElementsPerPage = 20

interface PageSwitchProps {
  totalNumberOfElements: number
  elementsPerPage?: number
  numberOfElementsLoaded?: number
}

const PageSwitch = ({ totalNumberOfElements, elementsPerPage, numberOfElementsLoaded }: PageSwitchProps) => {
  const { t } = useTranslation()
  const currentPage = usePageNumber()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSettingPageManually, setIsSettingPageManually] = useState(false)
  const [manuallySetPage, setManuallySetPage] = useState<number | ''>(currentPage)

  const manualPageInputRef = useRef<HTMLInputElement>(null)

  const locationSearch = useMemo(() => new URLSearchParams(location.search), [location.search])

  useOnClickOutside({ ref: manualPageInputRef, handler: () => setIsSettingPageManually(false) })

  const handlePageSwitch = (direction: 'previous' | 'next') => {
    setPageNumber(direction === 'previous' ? currentPage - 1 : currentPage + 1)
  }

  const handlePageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') setManuallySetPage('')

    const pageNumber = parseInt(e.target.value)

    if (!pageNumber) return

    setManuallySetPage(pageNumber)
  }

  const handlePageInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manuallySetPage) {
      setPageNumber(manuallySetPage)
      setIsSettingPageManually(false)
    }
  }

  const setPageNumber = useCallback(
    (pageNumber: number) => {
      locationSearch.set('p', pageNumber.toString())
      navigate({ search: locationSearch.toString() })
    },
    [locationSearch, navigate]
  )

  const totalNumberOfPages =
    totalNumberOfElements && Math.ceil(totalNumberOfElements / (elementsPerPage || defaultElementsPerPage))

  // Redirect if page number is incorrect
  useEffect(() => {
    if (currentPage < 1) {
      setPageNumber(1)
    } else if (totalNumberOfPages && currentPage > totalNumberOfPages) {
      setPageNumber(totalNumberOfPages)
    } else if (isNaN(currentPage)) {
      setPageNumber(1)
    }
  }, [currentPage, setPageNumber, totalNumberOfPages])

  useEffect(() => {
    setManuallySetPage(currentPage)
  }, [currentPage])

  if (totalNumberOfElements === 0) return null

  return (
    <SwitchContainer>
      <TextButton disabled={currentPage === 1} onClick={() => handlePageSwitch('previous')}>
        <RiArrowLeftSLine />
        <span>{t('Previous')}</span>
      </TextButton>
      {isSettingPageManually ? (
        <PageManualInput
          value={manuallySetPage}
          ref={manualPageInputRef}
          onChange={handlePageInputChange}
          onKeyDown={handlePageInputKeyDown}
          autoFocus
        />
      ) : (
        <PageNumbers onClick={() => setIsSettingPageManually(true)}>
          {currentPage}
          {totalNumberOfPages && <TotalNumberOfPages>{` / ${totalNumberOfPages}`}</TotalNumberOfPages>}
        </PageNumbers>
      )}
      <TextButton
        disabled={
          totalNumberOfPages
            ? totalNumberOfPages === currentPage
            : numberOfElementsLoaded
              ? numberOfElementsLoaded < 20
              : false
        }
        onClick={() => handlePageSwitch('next')}
      >
        <span>{t('Next')}</span>
        <RiArrowRightSLine />
      </TextButton>
    </SwitchContainer>
  )
}

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  height: ${manualInputHeight}px;
`

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  text-align: center;
  font-weight: 600;
  height: ${manualInputHeight}px;
  margin: 5px;
  border: 1px solid transparent;
  transition: all 0.1s ease-out;

  &:hover {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border.primary};
    background-color: ${({ theme }) => colord(theme.bg.primary).alpha(0.8).toHex()};
  }
`

const TotalNumberOfPages = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const PageManualInput = styled.input`
  height: ${manualInputHeight};
  padding: 5px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  width: 80px;
  margin: 0 10px;
  text-align: center;
`

export default PageSwitch
