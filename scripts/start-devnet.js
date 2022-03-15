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

const fs = require('fs')
const process = require('process')
const path = require('path')
const fetch = require('cross-fetch')
const spawn = require('child_process').spawn

async function _downloadFullNode(tag, fileName) {
  const url = `https://github.com/alephium/alephium/releases/download/v${tag}/alephium-${tag}.jar`
  const res0 = await fetch(url)
  const fileUrl = res0.url
  const res1 = await fetch(fileUrl)
  await new Promise((resolve, reject) => {
    console.log(`Downloading jar file to: ${fileName}`)
    const file = fs.createWriteStream(fileName)
    res1.body.pipe(file)
    file.on('finish', function () {
      resolve()
    })
  })
}

async function downloadFullNode(tag, devDir, jarFile) {
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir)
  }
  const jarExisted = fs.existsSync(jarFile)
  if (!jarExisted) {
    await _downloadFullNode(tag, jarFile)
  }
}

function launchDevnet(devDir, jarFile) {
  const pidFile = devDir + path.sep + 'alephium.pid'
  try {
    const pid = parseInt(fs.readFileSync(pidFile).toString())
    if (pid) {
      console.log(`Clearing the running devnet: ${pid}`)
      process.kill(pid)
    }
  } catch (_) {}
  fs.rmSync(devDir + path.sep + 'logs', { recursive: true, force: true })
  fs.rmSync(devDir + path.sep + 'network-4', { recursive: true, force: true })

  const p = spawn('java', ['-jar', jarFile], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, ALEPHIUM_HOME: devDir, ALEPHIUM_ENABLE_DEBUG_LOGGING: 'true' }
  })
  p.unref()
  console.log(`Devnet is launching with pid: ${p.pid}`)
  fs.writeFileSync(devDir + path.sep + 'alephium.pid', p.pid.toString(), { falg: 'w' })
}

const testWallet = 'alephium-js-test-only-wallet'
const password = 'alph'
const mnemonic =
  'vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault vault'

async function prepareWallet() {
  const wallets = await fetch('http://127.0.0.1:22973/wallets', { method: 'Get' }).then((res) => res.json())
  if (wallets.find((wallet) => wallet.walletName === testWallet)) {
    unlockWallet()
  } else {
    createWallet()
  }
}

async function createWallet() {
  console.log('Create the test wallet')
  await fetch('http://127.0.0.1:22973/wallets', {
    method: 'Put',
    body: `{"password":"${password}","mnemonic":"${mnemonic}","walletName":"${testWallet}"}`
  })
}

async function unlockWallet() {
  console.log('Unlock the test wallet')
  await fetch('http://127.0.0.1:22973/wallets/alephium-js-test-only-wallet/unlock', {
    method: 'POST',
    body: '{ "password": "alph" }'
  })
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function wait() {
  console.log('...')
  try {
    const res = await fetch('http://127.0.0.1:22973/infos/node', { method: 'Get' })
    if (res.status != 200) {
      await timeout(1000)
      await wait()
    } else {
      console.log('Devnet is ready')
      await timeout(1000)
      new Promise((resolve, reject) => {
        resolve()
      })
    }
  } catch (err) {
    await timeout(1000)
    await wait()
  }
}

const tag = process.argv[2]
console.log(`Full node version: ${tag}`)
const devDir = path.resolve(process.cwd() + path.sep + 'dev')
const jarFile = `${devDir}${path.sep}alephium-${tag}.jar`

async function main() {
  console.log(`Dev folder: ${devDir}`)
  await downloadFullNode(tag, devDir, jarFile)
  launchDevnet(devDir, jarFile)
  await wait()
  await prepareWallet()
}

main()
