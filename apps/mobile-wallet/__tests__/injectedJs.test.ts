import { getInjectedJavaScript } from '~/features/ecosystem/dAppMessaging/injectedJs'

vi.mock('@alephium/wallet-dapp-provider/lib/provider.umd.json', () => ({
  default: { code: '/* mock UMD bundle */' }
}))

describe('INJECTED_JAVASCRIPT', () => {
  it('calls attach() at the top level, not inside a load event listener', () => {
    expect(getInjectedJavaScript()).toContain('AlephiumWalletProvider.attach()')
    expect(getInjectedJavaScript()).not.toMatch(/addEventListener\s*\(\s*["']load["']/)
  })

  it('guards attach() with a typeof check', () => {
    expect(getInjectedJavaScript()).toContain("typeof AlephiumWalletProvider !== 'undefined'")
  })
})
