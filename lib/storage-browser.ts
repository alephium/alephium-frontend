/*
Copyright 2018 - 2022 The Alephium Authors
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

class BrowserStorage {
  key: string

  constructor() {
    this.key = 'wallet'
  }

  remove = (name: string) => {
    window.localStorage.removeItem(`${this.key}-${name}`)
  }

  load = (name: string) => {
    const str = window.localStorage.getItem(`${this.key}-${name}`)
    if (str) {
      return JSON.parse(str)
    } else {
      throw new Error(`Unable to load wallet ${name}`)
    }
  }

  save = (name: string, json: unknown) => {
    const str = JSON.stringify(json)
    window.localStorage.setItem(`${this.key}-${name}`, str)
  }

  list = () => {
    const prefixLen = this.key.length + 1
    const xs = []
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.key)) {
        xs.push(key.substring(prefixLen))
      }
    }
    return xs
  }
}

export default BrowserStorage
