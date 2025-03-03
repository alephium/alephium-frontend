const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function getFileChecksum(path) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')

    fs.createReadStream(path)
      .on('error', reject)
      .on('data', (chunk) => hash.update(chunk))
      .on('close', () => resolve(hash.digest('hex')))
  })
}

exports.default = async function ({ artifactPaths }) {
  const checksums = []

  for (let i = 0; i < artifactPaths.length; i++) {
    const artifactPath = artifactPaths[i]

    if (!artifactPath.endsWith('.blockmap') && !artifactPath.endsWith('.snap') && !artifactPath.endsWith('.zip')) {
      const checksumFilePath = `${artifactPath}.checksum`
      const checksum = await getFileChecksum(artifactPath)

      fs.writeFileSync(checksumFilePath, `${checksum}  ${path.parse(artifactPath).base}`)

      checksums.push(checksumFilePath)
    }
  }

  return checksums
}
