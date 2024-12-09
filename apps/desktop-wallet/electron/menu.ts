/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { app, BrowserWindow, dialog, Menu, MenuItemConstructorOptions, shell } from 'electron'

import { CURRENT_VERSION, isMac, isWindows } from './utils'

// See https://www.electronjs.org/docs/latest/tutorial/performance#8-call-menusetapplicationmenunull-when-you-do-not-need-a-default-menu
Menu.setApplicationMenu(null)

export const setupAppMenu = (mainWindow: BrowserWindow) => {
  const menu = Menu.buildFromTemplate(generateMenuTemplate(mainWindow))
  Menu.setApplicationMenu(menu)
}

const generateMenuTemplate = (mainWindow: BrowserWindow): MenuItemConstructorOptions[] => [
  ...(isMac
    ? ([
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }
      ] as MenuItemConstructorOptions[])
    : []),
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? ([
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
            }
          ] as MenuItemConstructorOptions[])
        : ([{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }] as MenuItemConstructorOptions[]))
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forceReload' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      ...(isMac
        ? ([{ role: 'zoom' }, { type: 'separator' }, { role: 'front' }] as MenuItemConstructorOptions[])
        : ([{ role: 'close' }] as MenuItemConstructorOptions[]))
    ]
  },
  {
    role: 'help',
    submenu: [
      ...(isMac
        ? ([] as MenuItemConstructorOptions[])
        : isWindows
          ? ([{ role: 'about' }, { type: 'separator' }] as MenuItemConstructorOptions[])
          : ([
              {
                label: 'About',
                click: async () => {
                  mainWindow &&
                    dialog.showMessageBox(mainWindow, {
                      message: `Version ${CURRENT_VERSION}`,
                      title: 'About',
                      type: 'info'
                    })
                }
              }
            ] as MenuItemConstructorOptions[])),
      {
        label: 'Report an issue',
        click: async () => {
          await shell.openExternal('https://github.com/alephium/alephium-frontend/issues/new')
        }
      },
      {
        label: 'Get some help',
        click: async () => {
          await shell.openExternal('https://discord.gg/JErgRBfRSB')
        }
      }
    ]
  }
]
