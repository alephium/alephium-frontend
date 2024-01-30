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
const tc = require('@actions/tool-cache')

// Some constants from https://github.com/SSLcom/esigner-codesign/blob/develop/src/constants.ts
const CODESIGNTOOL_VERSION = 'v1.2.7'
const CODESIGNTOOL_BASEPATH = `CodeSignTool-${CODESIGNTOOL_VERSION}`
const CODESIGNTOOL_WINDOWS_SETUP_URL = `https://github.com/SSLcom/CodeSignTool/releases/download/${CODESIGNTOOL_VERSION}/CodeSignTool-${CODESIGNTOOL_VERSION}-windows.zip`
const CODESIGNTOOL_WINDOWS_RUN_CMD = 'CodeSignTool.bat'
const CODESIGNTOOL_PROPERTIES =
  'CLIENT_ID=kaXTRACNijSWsFdRKg_KAfD3fqrBlzMbWs6TwWHwAn8\n' +
  'OAUTH2_ENDPOINT=https://login.ssl.com/oauth2/token\n' +
  'CSC_API_ENDPOINT=https://cs.ssl.com\n' +
  'TSA_URL=http://ts.ssl.com'

const TEMP_DIR = path.join(__dirname, 'release', 'temp')
const CODESIGN_DIR = path.resolve(process.cwd(), 'codesign')
let ARCHIVE_PATH = process.env['CODESIGNTOOL_PATH'] ?? path.join(CODESIGN_DIR, CODESIGNTOOL_BASEPATH)

const dirsToCheck = [TEMP_DIR, CODESIGN_DIR]
dirsToCheck.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    console.log('\n❓ Could not find dir', dir)
    fs.mkdirSync(dir, { recursive: true })
    console.log('✅ Created dir', dir)
  }
})

async function sign(configuration) {
  console.log('\nSigning starts with following configuration: ', configuration)

  // Signing this file fails with the error: "code object is a malware. This code object cannot be signed using eSigner"
  // Not sure this file is needed. Check `allowElevation` here:
  // - https://www.electron.build/configuration/nsis.html
  if (configuration.path.endsWith('elevate.exe')) {
    console.log('\nSkipping elevate.exe signing')
    return
  }

  if (
    process.env.WINDOWS_SIGN_USER_NAME &&
    process.env.WINDOWS_SIGN_PASSWORD &&
    process.env.WINDOWS_SIGN_TOTP_SECRET &&
    process.env.WINDOWS_SIGN_CREDENTIAL_ID
  ) {
    console.log(`✍️ Signing ${configuration.path}...`)

    if (!fs.existsSync(ARCHIVE_PATH)) {
      console.log(`⬇️ Downloading CodeSignTool from ${CODESIGNTOOL_WINDOWS_SETUP_URL}...`)
      const downloadedFile = await tc.downloadTool(CODESIGNTOOL_WINDOWS_SETUP_URL)
      console.log('✅ File downloaded!')

      console.log(`📦 Extracting CodeSignTool from download path ${downloadedFile} to ${CODESIGN_DIR}...`)
      await tc.extractZip(downloadedFile, CODESIGN_DIR)
      console.log('✅ Extracted!')

      const archiveName = fs.readdirSync(CODESIGN_DIR)[0]
      ARCHIVE_PATH = path.join(CODESIGN_DIR, archiveName)
    }

    console.log('\nPath of CodeSignTool:', ARCHIVE_PATH)
    console.log('\nList of files of CodeSignTool directory:')
    fs.readdirSync(ARCHIVE_PATH).forEach((file) => console.log(file))

    const sourceConfig = CODESIGNTOOL_PROPERTIES
    const destConfig = path.join(ARCHIVE_PATH, 'conf/code_sign_tool.properties')

    console.log(`\nWrite CodeSignTool config file to ${destConfig}`)
    console.log('\n---CONFIG FILE CONTENTS START---')
    console.log(sourceConfig)
    console.log('---CONFIG FILE CONTENTS END---\n')
    fs.writeFileSync(destConfig, sourceConfig, { encoding: 'utf-8', flag: 'w' })

    let execCmd = path.join(ARCHIVE_PATH, CODESIGNTOOL_WINDOWS_RUN_CMD)
    let batScriptContents = fs.readFileSync(execCmd, { encoding: 'utf-8', flag: 'r' })

    console.log('\n---BAT SCRIPT FILE CONTENTS START---')
    console.log(batScriptContents)
    console.log('---BAT SCRIPT FILE CONTENTS END---\n')

    console.log('\nTweaking bat script to add -Xmx and " around args...')
    batScriptContents = batScriptContents.replace(/java -jar/g, 'java -Xmx2048M -jar').replace(/\$@/g, `"\$@"`)

    console.log('\n---BAT SCRIPT FILE CONTENTS AFTER TWEAKING START---')
    console.log(batScriptContents)
    console.log('---BAT SCRIPT FILE CONTENTS AFTER TWEAKING END---\n')
    fs.writeFileSync(execCmd, batScriptContents, { encoding: 'utf-8', flag: 'w' })
    fs.chmodSync(execCmd, '0755')

    process.env['CODE_SIGN_TOOL_PATH'] = ARCHIVE_PATH
    process.env['JAVA_HOME'] = path.resolve(ARCHIVE_PATH, 'jdk-11.0.2')

    // CodeSignTool can't sign in place without verifying the overwrite with a
    // y/m interaction so we are creating a new file in a temp directory and
    // then replacing the original file with the signed file.
    const { name, dir } = path.parse(configuration.path)
    const tempFile = path.join(TEMP_DIR, name)
    const signFile = `cmd.exe -/c ${execCmd} sign -username="${process.env.WINDOWS_SIGN_USER_NAME}" -password="${process.env.WINDOWS_SIGN_PASSWORD}" -credential_id="${process.env.WINDOWS_SIGN_CREDENTIAL_ID}" -totp_secret="${process.env.WINDOWS_SIGN_TOTP_SECRET}" -input_file_path="${configuration.path}" -output_dir_path="${TEMP_DIR}"`
    const moveFile = `move "${tempFile}.exe" "${dir}"`

    console.log('🏃‍♂️ Running signing command...')
    childProcess.execSync(`${signFile} && ${moveFile}`, { stdio: 'inherit' })
    console.log('🏁 Finished signing\n🎉🎉🎉')
  } else {
    console.warn(`sign.js - Can't sign file ${configuration.path}, missing value for:
${process.env.WINDOWS_SIGN_USER_NAME ? '' : 'WINDOWS_SIGN_USER_NAME'}
${process.env.WINDOWS_SIGN_PASSWORD ? '' : 'WINDOWS_SIGN_PASSWORD'}
${process.env.WINDOWS_SIGN_CREDENTIAL_ID ? '' : 'WINDOWS_SIGN_CREDENTIAL_ID'}
${process.env.WINDOWS_SIGN_TOTP_SECRET ? '' : 'WINDOWS_SIGN_TOTP_SECRET'}
`)
    process.exit(1)
  }
}

exports.default = sign
