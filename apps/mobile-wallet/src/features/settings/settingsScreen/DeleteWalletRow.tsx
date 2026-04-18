import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Row from '~/components/Row'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useWalletSwitch from '~/hooks/useWalletSwitch'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { resetNavigation } from '~/utils/navigation'

const DeleteWalletRow = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'SettingsScreen', undefined>>()
  const walletList = useAppSelector((s) => s.wallets.list)
  const currentWalletId = useAppSelector((s) => s.wallet.id)
  const { switchWallet } = useWalletSwitch()

  const handleDeleteButtonPress = () => {
    const onDelete = async () => {
      const remainingWallets = walletList.filter((w) => w.id !== currentWalletId)

      if (remainingWallets.length > 0) {
        await switchWallet(remainingWallets[0].id)
      } else {
        resetNavigation(navigation, 'LandingScreen')
      }
    }

    dispatch(openModal({ name: 'WalletDeleteModal', props: { onDelete } }))
  }

  return (
    <Row onPress={handleDeleteButtonPress} title={t('Delete wallet')} titleColor={theme.global.alert} isLast>
      <Ionicons name="trash-outline" size={18} color={theme.global.alert} />
    </Row>
  )
}

export default DeleteWalletRow
