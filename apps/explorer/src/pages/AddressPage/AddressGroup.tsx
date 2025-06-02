import { getHumanReadableError } from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import { useSnackbar } from '@/hooks/useSnackbar'
import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressGroupProps {
  addressStr: string
}

const AddressGroup = ({ addressStr }: AddressGroupProps) => {
  const { t } = useTranslation()
  const { displaySnackbar } = useSnackbar()

  let addressGroup

  try {
    addressGroup = groupOfAddress(addressStr)
  } catch (e) {
    console.log(e)

    displaySnackbar({
      text: getHumanReadableError(e, t('Could not get the group of this address')),
      type: 'alert'
    })
  }

  return <InfoGrid.Cell label={t('Address group')} value={addressGroup?.toString()} />
}

export default AddressGroup
