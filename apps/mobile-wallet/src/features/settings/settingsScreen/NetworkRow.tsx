import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { capitalize } from 'lodash'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Row from '~/components/Row'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

const NetworkRow = () => {
  const { t } = useTranslation()
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const openNetworkModal = () =>
    dispatch(
      openModal({
        name: 'SwitchNetworkModal',
        props: { onCustomNetworkPress: () => navigation.navigate('CustomNetworkScreen') }
      })
    )

  return (
    <Row title={t('Current network')} onPress={openNetworkModal}>
      <AppText bold>{capitalize(currentNetworkName)}</AppText>
    </Row>
  )
}

export default NetworkRow
