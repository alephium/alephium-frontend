#!/usr/bin/env node
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

import fsExtra from 'fs-extra'
import process from 'process'
import path from 'path'
import findup from 'find-up'
import chalk from 'chalk'

function getPackageRoot(): string {
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
  console.log('Please provide a project name')
  console.log(`  ${chalk.cyan('alephium')} ${chalk.green('<project-name>')}`)
  console.log()
  console.log('For example:')
  console.log(`  ${chalk.cyan('alephium')} ${chalk.green('my-alephium-dapp')}`)
  console.log()
  process.exit(1)
}
const projectRoot = path.join(projectParent, projectName)
if (fsExtra.existsSync(projectRoot)) {
  console.log(`Project ${projectName} already exists. Try a different name.`)
  console.log()
  process.exit(1)
}
console.log('Copying files')
console.log(`  from ${packageRoot}`)
console.log(`  to ${projectRoot}`)
console.log('...')

function copy(dir: string, files: string[]) {
  const packageDevDir = path.join(packageRoot, dir)
  const projectDevDir = path.join(projectRoot, dir)
  fsExtra.mkdirSync(projectDevDir)
  for (const file of files) {
    fsExtra.copyFileSync(path.join(packageDevDir, file), path.join(projectDevDir, file))
  }
}

copy('', ['.gitattributes'])
copy('dev', ['user.conf'])
copy('scripts', ['start-devnet.js', 'stop-devnet.js'])
copy('contracts', ['greeter.ral', 'greeter-main.ral'])
fsExtra.mkdirSync(path.join(projectRoot, 'src'))
fsExtra.copySync(path.join(packageRoot, 'gitignore'), path.join(projectRoot, '.gitignore'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'package.tpl.json'), path.join(projectRoot, 'package.json'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'tsconfig.tpl.json'), path.join(projectRoot, 'tsconfig.json'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'README.tpl.md'), path.join(projectRoot, 'README.md'))
fsExtra.copySync(path.join(packageRoot, 'templates', 'greeter.tpl.ts'), path.join(projectRoot, 'src', 'greeter.ts'))

console.log('✅ Done.')
console.log()
console.log('✨ Project is initialized!')
console.log()
console.log('Next steps:')
console.log(`  ${chalk.cyan(`cd ${projectName}`)}`)
console.log(`  ${chalk.cyan('npm install')}`)
console.log(`  ${chalk.cyan('npm run compile')}`)
console.log(`  ${chalk.cyan('npm run devnet:start')}`)
console.log(`  ${chalk.cyan('node dist/greeter.js')}`)
