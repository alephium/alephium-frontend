import { getBaseAddressStr, selectAddressGroup } from '@alephium/shared'
import { getAddressExplorerPagePath } from '@alephium/shared-react'
import { isGrouplessAddress, isGrouplessAddressWithoutGroupIndex } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Menu from '@/components/Menu'
import { useAppSelector } from '@/hooks/redux'
import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressGroupProps {
  addressStr: string
}

const AddressGroup = ({ addressStr }: AddressGroupProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const addressGroup = useAppSelector((s) => selectAddressGroup(s, addressStr))

  if (addressGroup === undefined) return null

  const baseAddressStr = getBaseAddressStr(addressStr)

  return (
    <InfoGrid.Cell
      label={t('Group(s)')}
      value={
        isGrouplessAddress(addressStr) ? (
          <GroupMenu
            label={
              isGrouplessAddressWithoutGroupIndex(addressStr)
                ? t('All')
                : `${t('Group {{ number }}', { number: addressGroup })}`
            }
            items={[
              {
                text: t('All'),
                onClick: () => {
                  navigate(getAddressExplorerPagePath(baseAddressStr))
                }
              },
              ...Array.from({ length: 4 }).map((_, i) => ({
                text: t('Group {{ number }}', { number: i }),
                onClick: () => {
                  navigate(getAddressExplorerPagePath(`${baseAddressStr}:${i}`))
                }
              }))
            ]}
            direction="down"
          />
        ) : (
          addressGroup
        )
      }
    />
  )
}

export default AddressGroup

const GroupMenu = styled(Menu)`
  border: 1px solid ${({ theme }) => theme.border.primary};
  width: fit-content;
  min-width: 120px;
  font-size: 17px;
  font-weight: 500;
`
