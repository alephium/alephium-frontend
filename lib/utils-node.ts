// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import fs from 'fs'

interface AlfStorage {
  walletsUrl: URL
  remove: (name: string) => void
  load: (name: string) => void
  save: (name: string, json: object) => void
  list: () => string[]
}

function AlfStorage(this: AlfStorage) {
  this.walletsUrl = new URL('file:///' + process.env.HOME + '/.alf-wallets')

  if (!fs.existsSync(this.walletsUrl.toString())) {
    fs.mkdirSync(this.walletsUrl.toString())
  }

  this.remove = function (name: string) {
    fs.unlinkSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat').toString())
  }

  this.load = function (name: string) {
    const buffer = fs.readFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat').toString())
    if (typeof buffer !== 'undefined') {
      return JSON.parse(buffer.toString())
    }
    return null
  }

  this.save = function (name: string, json: object) {
    const str = JSON.stringify(json)
    const data = new Uint8Array(Buffer.from(str))
    fs.writeFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat').toString(), data)
  }

  this.list = function () {
    var xs: string[] = []
    try {
      const files = fs.readdirSync(this.walletsUrl.toString())
      files.forEach(function (file) {
        if (file.endsWith('.dat')) {
          xs.push(file.substring(0, file.length - 4))
        }
      })
    } catch (e) {
      return []
    }

    return xs
  }
}

export default AlfStorage
