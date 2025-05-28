import { AddressHash, selectAddressByHash } from '@alephium/shared'
import { isGrouplessAddress } from '@alephium/web3'
import { useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import AddressTokensBadgesList from '@/features/assetsLists/AddressTokensBadgesList'
import { useAppSelector } from '@/hooks/redux'

interface SelectOptionAddressProps {
  addressHash: AddressHash
  className?: string
  subtitle?: ReactNode
}

const SelectOptionAddress = ({ addressHash, className, subtitle }: SelectOptionAddressProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <SelectOptionItemContent
      ref={ref}
      className={className}
      displaysCheckMarkWhenSelected
      contentDirection="column"
      divider
      dividerOffset={30}
      MainContent={
        <Header>
          <AddressBadgeContainer>
            <AddressBadgeStyled addressHash={addressHash} disableA11y truncate appendHash />
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </AddressBadgeContainer>
          <AddressGroup addressHash={addressHash} />
        </Header>
      }
      SecondaryContent={
        isInView ? (
          <AddressTokensBadgeListContainer>
            <AddressTokensBadgesList addressHash={addressHash} />
          </AddressTokensBadgeListContainer>
        ) : null
      }
    />
  )
}

export default SelectOptionAddress

const AddressGroup = ({ addressHash }: Pick<SelectOptionAddressProps, 'addressHash'>) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const { t } = useTranslation()

  if (!address || isGrouplessAddress(address.hash)) return null

  return (
    <Group>
      {t('Group')} {address.group}
    </Group>
  )
}

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
  font-size: 12px;
`

const AddressBadgeContainer = styled.div`
  flex: 1;
  gap: 10px;
  display: flex;
  flex-direction: column;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 15px;
  max-width: 70%;
`

const Subtitle = styled.div`
  font-weight: 500;
`

const AddressTokensBadgeListContainer = styled.div`
  margin-left: var(--spacing-4);
`
