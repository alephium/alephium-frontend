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

const fetch = require('cross-fetch')
const process = require('process')

async function extractNodeVersionFromExplorer(explorerVersion) {
  const url = `https://raw.githubusercontent.com/alephium/explorer-backend/v${explorerVersion}/project/Dependencies.scala`
  const response = await (await fetch(url)).text()
  const regex = /val common = "[^"]+"/
  const matched = regex.exec(response)[0]
  return matched.split('"')[1]
}

async function main() {
  const nodeVersionConfigured = process.argv[2]
  const explorerVersionConfigured = process.argv[3]
  const nodeVersionExpected = await extractNodeVersionFromExplorer(explorerVersionConfigured)

  if (nodeVersionExpected != nodeVersionConfigured) {
    console.log(
      `Invalid node version: the configured explorer-backend version (${explorerVersionConfigured}) expects node ${nodeVersionExpected}.`
    )
    console.log(`Instead, the configured node version is ${nodeVersionConfigured}`)
    console.log('Please, check that the configured node and explorer-backend versions in the package.json are correct.')
    process.exit(1)
  }
}

main()
