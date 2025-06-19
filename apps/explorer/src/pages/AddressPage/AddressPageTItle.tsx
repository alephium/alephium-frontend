import { useTranslation } from 'react-i18next'

import HighlightedHash from '@/components/HighlightedHash'
import SectionTitle from '@/components/SectionTitle'
import useIsContract from '@/pages/AddressPage/useIsContract'

interface AddressPageTitleProps {
  addressStr: string
}

const AddressPageTitle = ({ addressStr }: AddressPageTitleProps) => {
  const { t } = useTranslation()
  const isContract = useIsContract(addressStr)

  return (
    <SectionTitle
      title={isContract ? t('Contract') : t('Addresses_one')}
      subtitle={<HighlightedHash text={addressStr} textToCopy={addressStr} />}
    />
  )
}

export default AddressPageTitle
