import Ajv from 'ajv'
import announcement from 'announcement.json'
import path from 'path'
import { createGenerator } from 'ts-json-schema-generator'

const repoRoot = process.cwd()
const config = {
  path: path.join(repoRoot, 'src', 'types', 'announcement.ts'),
  tsconfig: path.join(repoRoot, 'tsconfig.json'),
  type: 'Announcement'
}

const schema = createGenerator(config).createSchema('Announcement')
const ajv = new Ajv()
const validateJson = ajv.compile(schema)

it('Should validate announcement JSON', () => {
  assert(validateJson(announcement))
})
