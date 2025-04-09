import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'

type RootStackParamList = {
  LandingScreen: undefined
  NewWalletIntroScreen: undefined
  NewWalletNameScreen: undefined
  AddBiometricsScreen: undefined
  NewWalletSuccessScreen: undefined
  ImportWalletSeedScreen: undefined
  ImportWalletAddressDiscoveryScreen: undefined
  InWalletTabsNavigation: undefined
  LoginWithPinScreen: undefined
  SwitchWalletScreen?: {
    disableBack?: boolean
  }
  NewAddressScreen: undefined
  SettingsScreen: undefined
  SendNavigation?: {
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
  HiddenTokensScreen: undefined
}

export default RootStackParamList
