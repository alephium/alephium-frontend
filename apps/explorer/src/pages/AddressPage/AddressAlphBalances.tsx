import { useFetchAddressBalancesAlph } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'

import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressAlphBalancesProps {
  addressStr: string
}

const AddressAlphBalances = ({ addressStr }: AddressAlphBalancesProps) => {
  const { data: addressBalances } = useFetchAddressBalancesAlph({ addressHash: addressStr })
  const { t } = useTranslation()

  const totalBalance = addressBalances?.totalBalance
  const lockedBalance = addressBalances?.lockedBalance

  return (
    <InfoGrid.Cell
      label={t('ALPH balance')}
      value={totalBalance && <Amount assetId={ALPH.id} value={BigInt(totalBalance)} />}
      sublabel={
        lockedBalance &&
        lockedBalance !== '0' && (
          <Badge
            content={
              <span>
                {t('Locked')}: <Amount assetId={ALPH.id} value={BigInt(lockedBalance)} />
              </span>
            }
            type="neutral"
          />
        )
      }
    />
  )
}

export default AddressAlphBalances
