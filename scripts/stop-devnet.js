import fs from 'fs'
import path from 'path'
import process from 'process'

const pidFile = process.cwd() + path.sep + 'dev' + path.sep + 'alephium.pid'
try {
  const pid = parseInt(fs.readFileSync(pidFile).toString())
  if (pid) {
    console.log(`Killing the running devnet: ${pid}`)
    process.kill(pid)
  }
} catch (_) {}
