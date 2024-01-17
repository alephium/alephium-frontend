/*
Copyright 2018 - 2023 The Alephium Authors
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

const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

const TEMP_DIR = path.join(__dirname, 'release', 'temp')

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

function sign(configuration) {
  // credentials from ssl.com
  const USER_NAME = process.env.ES_USERNAME
  const USER_PASSWORD = process.env.ES_PASSWORD
  const CREDENTIAL_ID = process.env.CREDENTIAL_ID
  const USER_TOTP = process.env.ES_TOTP_SECRET

  if (USER_NAME && USER_PASSWORD && USER_TOTP && CREDENTIAL_ID) {
    console.log(`Signing ${configuration.path}`)

    const { name, dir } = path.parse(configuration.path)
    // CodeSignTool can't sign in place without verifying the overwrite with a
    // y/m interaction so we are creating a new file in a temp directory and
    // then replacing the original file with the signed file.
    const tempFile = path.join(TEMP_DIR, name)
    const setDir = `cd ../CodeSignTool-v1.3.0-windows`
    const signFile = `CodeSignTool sign -input_file_path="${configuration.path}" -output_dir_path="${TEMP_DIR}" -credential_id="${CREDENTIAL_ID}" -username="${USER_NAME}" -password="${USER_PASSWORD}" -totp_secret="${USER_TOTP}"`
    const moveFile = `move "${tempFile}.exe" "${dir}"`

    childProcess.execSync(`${setDir} && ${signFile} && ${moveFile}`, { stdio: 'inherit' })
  } else {
    console.warn(`sign.js - Can't sign file ${configuration.path}, missing value for:
${USER_NAME ? '' : 'ES_USERNAME'}
${USER_PASSWORD ? '' : 'ES_PASSWORD'}
${CREDENTIAL_ID ? '' : 'CREDENTIAL_ID'}
${USER_TOTP ? '' : 'ES_TOTP_SECRET'}
`)
    process.exit(1)
  }
}

exports.default = sign
