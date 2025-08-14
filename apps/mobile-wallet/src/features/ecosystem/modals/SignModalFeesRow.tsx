import { useTranslation } from 'react-i18next'

import Row, { RowProps } from '~/components/Row'
import FeeAmounts from '~/features/send/screens/FeeAmounts'

interface SignModalFeesRowProps extends RowProps {
  fees: bigint
}

const SignModalFeesRow = ({ fees, ...props }: SignModalFeesRowProps) => {
  const { t } = useTranslation()

  return (
    <Row title={t('Estimated fees')} titleColor="secondary" isLast {...props}>
      <FeeAmounts fees={fees} />
    </Row>
  )
}

export default SignModalFeesRow
