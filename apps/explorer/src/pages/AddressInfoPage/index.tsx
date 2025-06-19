import { isValidAddress } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useSnackbar } from '@/hooks/useSnackbar'
import AddressPage from '@/pages/AddressPage/AddressPage'

type ParamTypes = {
  id: string
}

const AddressInfoPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<ParamTypes>()
  const { displaySnackbar } = useSnackbar()
  const navigate = useNavigate()

  const addressHash = id && isValidAddress(id) ? id : ''

  if (!addressHash || !isValidAddress(addressHash)) {
    displaySnackbar({ text: t('The address format seems invalid'), type: 'alert' })
    navigate('/404')
    return
  }

  return <AddressPage addressStr={addressHash} />
}

export default AddressInfoPage
