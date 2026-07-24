import { AddressHash } from '@alephium/shared/types'
import { NavigationProp, useNavigation } from '@react-navigation/native'

import { openModal } from '~/features/modals/modalActions'
import useWalletSingleAddress from '~/hooks/addresses/useWalletSingleAddress'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

const useGoToReceive = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const walletSingleAddressHash = useWalletSingleAddress({ checkBalance: false })
  const dispatch = useAppDispatch()

  return (addressHash?: AddressHash) => {
    const receiveAddressHash = addressHash || walletSingleAddressHash

    if (receiveAddressHash) {
      dispatch(openModal({ name: 'ReceiveQRCodeModal', props: { addressHash: receiveAddressHash } }))
    } else {
      navigation.navigate('ReceiveNavigation')
    }
  }
}

export default useGoToReceive
