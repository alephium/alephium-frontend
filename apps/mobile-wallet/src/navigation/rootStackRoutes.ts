import { SendOrigin } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { Token } from '@alephium/web3'

import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'

type RootStackParamList = {
  LandingScreen?: {
    isAddingWallet?: boolean
  }
  NewWalletIntroScreen: undefined
  NewWalletNameScreen: undefined
  AddBiometricsScreen: undefined
  NewWalletSuccessScreen: undefined
  ImportWalletSeedScreen: undefined
  ImportWalletAddressDiscoveryScreen: undefined
  InWalletTabsNavigation: {
    screen?: keyof InWalletTabsParamList
  }
  LoginWithPinScreen: undefined
  SwitchWalletScreen?: {
    disableBack?: boolean
  }
  NewAddressScreen: undefined
  SettingsScreen: undefined
  SendNavigation?: {
    origin: SendOrigin
    originAddressHash?: AddressHash
    destinationAddressHash?: AddressHash
    tokenId?: Token['id']
    isNft?: boolean
  }
  ReceiveNavigation: undefined
  ContactScreen: {
    contactId: string
  }
  BackupMnemonicNavigation: undefined
  AddressDiscoveryScreen?: {
    isImporting?: boolean
    startScanning?: boolean
  }
  NewContactScreen?: {
    addressHash: AddressHash
  }
  EditContactScreen: {
    contactId: string
  }
  SelectImportMethodScreen: undefined
  DecryptScannedMnemonicScreen: undefined
  EditWalletNameScreen: undefined
  CustomNetworkScreen: undefined
  PublicKeysScreen: undefined
  FundPasswordScreen: undefined
  DAppWebViewScreen: {
    dAppUrl: string
    dAppName: string
  }
  SwapScreen?: {
    initialFromTokenId?: Token['id']
  }
  HiddenTokensScreen: undefined
  AuthorizedConnectionsScreen: undefined
  WatchOnlyAddressScreen: undefined
}

export default RootStackParamList
