import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { app, net, protocol } from 'electron'

import { APP_ROOT_PATH } from './paths'

export const DEPRECATED_APP_PROTOCOL = 'file'
export const APP_PROTOCOL = 'alephium'

// See: https://www.electronjs.org/docs/latest/tutorial/security#18-avoid-usage-of-the-file-protocol-and-prefer-usage-of-custom-protocols
export const registerAppProtocol = () => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_PROTOCOL,
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true
      }
    }
  ])

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient(APP_PROTOCOL)
  }
}

export const handleAppProtocolRequests = () => {
  protocol.handle(APP_PROTOCOL, (request) => {
    const filePath = request.url.slice(`${APP_PROTOCOL}://`.length)

    // Validate the path to prevent directory traversal attacks
    const pathToServe = path.resolve(APP_ROOT_PATH, filePath)
    const relativePath = path.relative(APP_ROOT_PATH, pathToServe)
    const isSafe = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

    return isSafe
      ? net.fetch(pathToFileURL(pathToServe).toString())
      : new Response('Invalid path', { status: 400, headers: { 'content-type': 'text/plain' } })
  })
}
