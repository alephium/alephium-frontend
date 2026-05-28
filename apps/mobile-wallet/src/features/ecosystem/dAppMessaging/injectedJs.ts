import alephiumProvider from '@alephium/wallet-dapp-provider/lib/provider.umd.json'
import { Platform } from 'react-native'

// This polyfill exists because of a platform difference in React Native WebView.
// When the native side sends a message to the WebView via webViewRef.current.postMessage(data):
// - iOS: The message event fires on window
// - Android: The message event fires on document instead
// The wallet-dapp-provider's waitForMessage() listens on window.addEventListener('message', ...).
// Without the polyfill, it would never receive native responses on Android.
const windowMessagePolyfill =
  Platform.OS === 'android'
    ? `
if (!window.originalPostMessage) {
  window.originalPostMessage = window.postMessage;
  document.addEventListener('message', function(event) {
    window.dispatchEvent(new MessageEvent('message', { data: event.data }));
  });
}
`
    : ''

export const getInjectedJavaScript = (): string => `
${windowMessagePolyfill}

${alephiumProvider.code}

if (typeof AlephiumWalletProvider !== 'undefined' && !window.__alephiumProviderAttached) {
  window.__alephiumProviderAttached = true;
  AlephiumWalletProvider.attach();
}

true; // note: this is required, or you'll sometimes get silent failures
`

// Useful for debugging, simply move them inside getInjectedJavaScript
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
// };

// window.console.error = function(...args) {
//   window.ReactNativeWebView.postMessage(JSON.stringify({
//     type: 'CONSOLE_ERROR',
//     data: args.map(a => a instanceof Error ? a.message : a)
//   }));
// };
