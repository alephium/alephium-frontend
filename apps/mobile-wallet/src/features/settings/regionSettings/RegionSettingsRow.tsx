import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Row from '~/components/Row'
import { openModal } from '~/features/modals/modalActions'
import { regionOptions } from '~/features/settings/regionSettings/regionsUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const RegionSettingsRow = () => {
  const currentRegion = useAppSelector((s) => s.settings.region)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openRegionSelectModal = () => dispatch(openModal({ name: 'RegionSelectModal' }))

  return (
    <Row onPress={openRegionSelectModal} title={t('Region')}>
      <AppText bold>{regionOptions.find((region) => region.value === currentRegion)?.label}</AppText>
    </Row>
  )
}

export default RegionSettingsRow
