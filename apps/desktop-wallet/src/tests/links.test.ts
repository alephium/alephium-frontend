import fs from 'node:fs'
import http, { IncomingMessage } from 'node:http'
import https from 'node:https'

import { uniq } from 'lodash'
import path from 'path'

const pathsToUIRelatedCode = [
  path.resolve(__dirname, '..', 'components'),
  path.resolve(__dirname, '..', 'modals'),
  path.resolve(__dirname, '..', 'pages'),
  path.resolve(__dirname, '..', 'contexts'),
  path.resolve(__dirname, '..', 'hooks'),
  path.resolve(__dirname, '..', '..', 'public')
]

async function findLinksInSource(file: string) {
  const source = await fs.promises.readFile(file, { encoding: 'utf-8' })
  return source.match(/http(s)?:\/\/[^ <>\n'"${}]+/g)
}

async function getFilesRecursively(dir: string): Promise<string[]> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFilesRecursively(res) : res
    })
  )
  return Array.prototype.concat(...files)
}

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'
const httpClientOptions = {
  headers: { 'User-Agent': userAgent }
}

function request(link: string, callback: (res: IncomingMessage) => void) {
  const client = link.match(/^https:\/\//) ? https : http
  return client.get(link, httpClientOptions, callback)
}

it('has all valid links in the UI', async () => {
  const filesInDir = await Promise.all(pathsToUIRelatedCode.map((dir) => getFilesRecursively(dir)))
  const files = filesInDir.flatMap((x) => x)

  const linksFound = await Promise.all(files.map((file) => findLinksInSource(file)))
  const links = linksFound
    .flatMap((x) => x)
    .filter((link) => link !== null)
    .filter((link) => link && link.match(/localhost/) === null)
  const linksDedup = uniq(links).filter((link) => link !== null) as string[]

  linksDedup.forEach((link) => {
    request(link, ({ statusCode }) =>
      statusCode && (statusCode < 200 || statusCode >= 400) ? console.error({ statusCode, link }) : console.log(link)
    ).on('error', (e) => console.error({ e, link }))
  })
}, 60000)
