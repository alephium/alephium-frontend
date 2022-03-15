#!/usr/bin/env node
import fsExtra from 'fs-extra'
import process from 'process'
import path from 'path'
import findup from 'find-up'
import { fileURLToPath } from 'url'

export function getPackageRoot(): string {
  const packageJsonPath = findup.sync('package.json', { cwd: path.dirname(__filename) })

  if (packageJsonPath) {
    return path.dirname(packageJsonPath)
  } else {
    throw new Error('Cannot find `package.json`')
  }
}

const packageRoot = getPackageRoot()
const projectParent = process.cwd()

const projectName = process.argv[2]
if (!projectName) {
  throw new Error('Please provide a project name')
}
const projectRoot = path.join(projectParent, projectName)
if (fsExtra.existsSync(projectRoot)) {
  throw new Error(`Project ${projectName} exists already.`)
}
console.log(`Start to copy files from ${packageRoot} to ${projectRoot}`)

function copy(dir: string, files: string[]) {
  const packageDevDir = path.join(packageRoot, dir)
  const projectDevDir = path.join(projectRoot, dir)
  fsExtra.mkdirSync(projectDevDir)
  for (const file of files) {
    fsExtra.copyFileSync(path.join(packageDevDir, file), path.join(projectDevDir, file))
  }
}

copy('', ['.gitignore', '.gitattributes'])
copy('dev', ['user.conf'])
copy('scripts', ['start-devnet.js', 'stop-devnet.js'])
copy('contracts', ['greeter.ral', 'greeter-main.ral'])
fsExtra.mkdirSync(path.join(projectRoot, 'src'))
fsExtra.mkdirSync(path.join(projectRoot, 'test'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'package.json'), path.join(projectRoot, 'package.json'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'tsconfig.json'), path.join(projectRoot, 'tsconfig.json'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'README.md'), path.join(projectRoot, 'README.md'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'greeter.ts'), path.join(projectRoot, 'src', 'greeter.ts'))

console.log('Project is initialized')
