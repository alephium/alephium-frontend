import alephiumProvider from '@alephium/wallet-dapp-provider/lib/provider.umd.json'

export const INJECTED_JAVASCRIPT = `
${alephiumProvider.code}

window.addEventListener("load", () => {
  if (typeof AlephiumWalletProvider !== 'undefined') {
    AlephiumWalletProvider.attach();
  }
});

true; // note: this is required, or you'll sometimes get silent failures
`
