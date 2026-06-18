import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

import { app, net, protocol } from 'electron'

import { APP_ROOT_PATH, ICON_PATH } from './paths'

const execFileAsync = promisify(execFile)

const isLinux = process.platform === 'linux'

export const DEPRECATED_APP_PROTOCOL = 'file'
export const APP_PROTOCOL = 'alephium'

// Human-readable name the desktop environment shows for the protocol handler
// (e.g. in the "open with" dialog when following an alephium:// link).
const APP_DISPLAY_NAME = 'Alephium'

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

  // setAsDefaultProtocolClient can't register the scheme for AppImage builds, so
  // do it ourselves. See https://github.com/alephium/alephium-frontend/issues/69
  void registerAppImageProtocolClient()
}

// An AppImage is a single portable binary that is never "installed", so — unlike
// the deb/snap packages — it ships no .desktop entry in
// ~/.local/share/applications. Without that entry the desktop environment can't
// map x-scheme-handler/alephium to the wallet: the "open with" dialog shows
// "xdg-open" and clicking a WalletConnect link does nothing (issue #69).
//
// We fix this by writing a .desktop entry pointing at the running AppImage
// ($APPIMAGE) and registering it as the default handler for the scheme. It runs
// on every launch (cheap, idempotent) so the Exec path self-heals if the
// AppImage is moved or updated.
const registerAppImageProtocolClient = async () => {
  const appImagePath = process.env.APPIMAGE

  if (!isLinux || !appImagePath) return

  try {
    const applicationsDir = path.join(os.homedir(), '.local', 'share', 'applications')
    // The basename doubles as the StartupWMClass so the desktop environment can
    // associate the running window with this entry. app.getName() is the value
    // Electron derives the Linux WM class from.
    const appName = app.getName()
    const desktopFileName = `${appName}.desktop`
    const desktopFilePath = path.join(applicationsDir, desktopFileName)

    const desktopFileContent = [
      '[Desktop Entry]',
      `Name=${APP_DISPLAY_NAME}`,
      `Exec=${escapeDesktopExecArg(appImagePath)} %U`,
      `Icon=${ensureAppImageIcon(appName)}`,
      'Terminal=false',
      'Type=Application',
      `StartupWMClass=${appName}`,
      'Categories=Finance;',
      `MimeType=x-scheme-handler/${APP_PROTOCOL};`,
      ''
    ].join('\n')

    // Re-registering is intrusive (it overrides the user's handler choice), so
    // only do it when something actually changed (first run, or moved AppImage).
    if (readFileOrNull(desktopFilePath) === desktopFileContent) return

    await fs.promises.mkdir(applicationsDir, { recursive: true })
    await fs.promises.writeFile(desktopFilePath, desktopFileContent)

    // Best-effort: refresh the MIME cache and set us as the default handler.
    // These CLIs may be absent on minimal systems — failures are non-fatal since
    // the .desktop file alone is enough for most environments.
    await runQuietly('update-desktop-database', [applicationsDir])
    await runQuietly('xdg-mime', ['default', desktopFileName, `x-scheme-handler/${APP_PROTOCOL}`])

    console.log(`Registered AppImage as ${APP_PROTOCOL}:// handler at ${desktopFilePath}`)
  } catch (e) {
    console.error('Failed to register AppImage as protocol handler:', e)
  }
}

// Copy the app icon to a stable location so the .desktop Icon key keeps
// resolving after the AppImage unmounts. Prefers the AppImage's own icon
// ($APPDIR/.DirIcon) and falls back to the bundled icon. Returns an absolute
// icon path, or the app name as a last resort (themed-icon lookup).
const ensureAppImageIcon = (appName: string): string => {
  try {
    const iconsDir = path.join(os.homedir(), '.local', 'share', 'icons')
    const iconDest = path.join(iconsDir, `${appName}.png`)
    const iconSource = [process.env.APPDIR && path.join(process.env.APPDIR, '.DirIcon'), ICON_PATH]
      .filter((p): p is string => Boolean(p))
      .find((p) => fs.existsSync(p))

    if (!iconSource) return appName

    fs.mkdirSync(iconsDir, { recursive: true })
    fs.copyFileSync(iconSource, iconDest)

    return iconDest
  } catch {
    return appName
  }
}

// Quote a path for the .desktop Exec key per the freedesktop spec: wrap in
// double quotes and backslash-escape the reserved characters " ` $ \
const escapeDesktopExecArg = (arg: string) => '"' + arg.replace(/(["`$\\])/g, '\\$1') + '"'

const readFileOrNull = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

const runQuietly = async (command: string, args: string[]) => {
  try {
    await execFileAsync(command, args)
  } catch (e) {
    console.warn(`Non-fatal: '${command}' failed:`, e instanceof Error ? e.message : e)
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
