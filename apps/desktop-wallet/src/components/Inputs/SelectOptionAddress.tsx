import { AddressHash } from '@alephium/shared'
import { useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import AddressTokensBadgesList from '@/features/assetsLists/AddressTokensBadgesList'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface SelectOptionAddressProps {
  addressHash: AddressHash
  isSelected?: boolean
  className?: string
  subtitle?: ReactNode
}

const SelectOptionAddress = ({ addressHash, isSelected, className, subtitle }: SelectOptionAddressProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <SelectOptionItemContent
      ref={ref}
      className={className}
      displaysCheckMarkWhenSelected
      isSelected={isSelected}
      contentDirection="column"
      MainContent={
        <Header>
          <AddressBadgeContainer>
            <AddressBadgeStyled addressHash={addressHash} disableA11y truncate appendHash />
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </AddressBadgeContainer>
          <Group>
            {t('Group')} {address?.group}
          </Group>
        </Header>
      }
      SecondaryContent={
        isInView ? <AddressTokensBadgesList addressHash={addressHash} withBackground showAmount /> : null
      }
    />
  )
}

export default SelectOptionAddress

const Header = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`

const Group = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: 400;
  display: flex;
  flex-shrink: 0;
`

const AddressBadgeContainer = styled.div`
  flex: 1;
  min-width: 0;
  gap: 10px;
  display: flex;
  flex-direction: column;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 17px;
  max-width: 70%;
`

const Subtitle = styled.div`
  font-weight: 500;
`
