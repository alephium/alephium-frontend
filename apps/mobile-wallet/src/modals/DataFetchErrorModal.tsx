import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import BottomModal from '~/features/modals/BottomModal'

interface DataFetchErrorModalProps {
  message?: string
}

const DataFetchErrorModal = memo<DataFetchErrorModalProps>(({ message }) => {
  const { t } = useTranslation()

  return (
    <BottomModal title={t('Temporarily unavailable data')} contentVerticalGap notScrollable>
      <AppText>{t('We are working on addressing this issue. Please try again later.')}</AppText>

      {message && (
        <InfoBox title="Error details" iconName="alert-octagon">
          <AppText>{message}</AppText>
        </InfoBox>
      )}
    </BottomModal>
  )
})

export default DataFetchErrorModal
