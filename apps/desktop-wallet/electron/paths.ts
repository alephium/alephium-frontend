import path from 'node:path'
import { fileURLToPath } from 'node:url'

import isDev from 'electron-is-dev'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const APP_ROOT_PATH = path.join(__dirname, '..')

export const RENDERER_PATH = 'build'

const VITE_PUBLIC_PATH = path.join(APP_ROOT_PATH, isDev ? 'public' : RENDERER_PATH)

export const ICON_PATH = path.join(VITE_PUBLIC_PATH, 'icons', 'logo-48.png')
