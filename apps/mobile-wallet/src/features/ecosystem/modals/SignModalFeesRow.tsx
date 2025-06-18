import { useTranslation } from 'react-i18next'

import Row from '~/components/Row'
import FeeAmounts from '~/features/send/screens/FeeAmounts'

interface SignModalFeesRowProps {
  fees: bigint
}

const SignModalFeesRow = ({ fees }: SignModalFeesRowProps) => {
  const { t } = useTranslation()

  return (
    <Row title={t('Estimated fees')} titleColor="secondary" isLast>
      <FeeAmounts fees={fees} />
    </Row>
  )
}

export default SignModalFeesRow
