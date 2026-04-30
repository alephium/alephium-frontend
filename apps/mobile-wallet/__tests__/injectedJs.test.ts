import { INJECTED_JAVASCRIPT } from '~/features/ecosystem/dAppMessaging/injectedJs'

vi.mock('@alephium/wallet-dapp-provider/lib/provider.umd.json', () => ({
  default: { code: '/* mock UMD bundle */' }
}))

describe('INJECTED_JAVASCRIPT', () => {
  it('calls attach() at the top level, not inside a load event listener', () => {
    expect(INJECTED_JAVASCRIPT).toContain('AlephiumWalletProvider.attach()')
    expect(INJECTED_JAVASCRIPT).not.toMatch(/addEventListener\s*\(\s*["']load["']/)
  })

  it('guards attach() with a typeof check', () => {
    expect(INJECTED_JAVASCRIPT).toContain("typeof AlephiumWalletProvider !== 'undefined'")
  })
})
