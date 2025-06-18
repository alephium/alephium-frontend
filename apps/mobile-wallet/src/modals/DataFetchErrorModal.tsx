import { AlertOctagon } from 'lucide-react-native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import BottomModal2 from '~/features/modals/BottomModal2'

interface DataFetchErrorModalProps {
  message?: string
}

const DataFetchErrorModal = memo<DataFetchErrorModalProps>(({ message }) => {
  const { t } = useTranslation()

  return (
    <BottomModal2 title={t('Temporarily unavailable data')} contentVerticalGap>
      <AppText>{t('We are working on addressing this issue. Please try again later.')}</AppText>

      {message && (
        <InfoBox title="Error details" Icon={AlertOctagon}>
          <AppText>{message}</AppText>
        </InfoBox>
      )}
    </BottomModal2>
  )
})

export default DataFetchErrorModal
