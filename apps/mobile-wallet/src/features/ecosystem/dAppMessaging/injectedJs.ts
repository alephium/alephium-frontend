import alephiumProvider from '@alephium/wallet-dapp-provider/lib/provider.umd.json'
import { Platform } from 'react-native'

const windowMessagePolyfill =
  Platform.OS === 'android'
    ? `
if (window.originalPostMessage) return;
window.originalPostMessage = window.postMessage;
document.addEventListener('message', function(event) {
  window.dispatchEvent(new MessageEvent('message', { data: event.data }));
});
`
    : ''

export const INJECTED_JAVASCRIPT = `
${windowMessagePolyfill}

${alephiumProvider.code}

window.addEventListener("load", () => {
  if (typeof AlephiumWalletProvider !== 'undefined') {
    AlephiumWalletProvider.attach();
  }
});

// window.onerror = function(message, source, lineno, colno, error) {
//   window.ReactNativeWebView.postMessage(JSON.stringify({
//     type: 'CONSOLE_ERROR',
//     data: { message, source, lineno, colno, error: error?.toString() }
//   }));
//   return true;
// };

// window.console.log = function(...args) {
//   window.ReactNativeWebView.postMessage(JSON.stringify({
//     type: 'CONSOLE_LOG',
//     data: args
//   }));
//   return true;
// };

true; // note: this is required, or you'll sometimes get silent failures
`
