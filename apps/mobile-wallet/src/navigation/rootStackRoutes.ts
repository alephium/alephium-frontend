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
  SendNavigation: undefined
  ReceiveNavigation: undefined
  ContactScreen: {
    contactId: string
  }
  BackupMnemonicNavigation: undefined
  AddressDiscoveryScreen?: {
    isImporting?: boolean
  }
  NewContactScreen: undefined
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
}

export default RootStackParamList
