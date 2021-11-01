import {promises as fs} from 'fs'
import {resolve} from 'path'
import {logger} from './logger'

type Args = {
  scope: string
  variable: string
  fileName: string
}

export async function writeFileFromENV(args: Args) {
  const log = logger(args.scope)
  const content = process.env[args.variable]

  if (content === undefined) {
    log.error(`${args.variable} env variable is not set`)
    process.exit(1)
  }

  const path = resolve(process.cwd(), args.fileName)

  log.info(`writing file to ${path}`)

  await fs.writeFile(path, content)

  log.success('success')
}
