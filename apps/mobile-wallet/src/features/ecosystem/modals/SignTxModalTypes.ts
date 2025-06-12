export type ModalOrigin = 'walletconnect' | 'in-app-browser'

export type SignTxModalCommonProps = {
  onError: (message: string) => void
  onReject: () => void
  origin: ModalOrigin
  dAppUrl?: string
  dAppIcon?: string
}
