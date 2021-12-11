import {$} from 'zx'
import {writeFileFromENV} from './tools/write-file-from-env'
import {logger} from './tools/logger'

const log = logger('postbuild')

async function main() {
  log.success('start')

  await writeFileFromENV({
    scope: 'ca-certificate',
    variable: 'CA_CERTIFICATE',
    fileName: 'ca-certificate.crt'
  })

  await $`cp -p ca-certificate.crt ./dist/ca-certificate.crt`

  log.success('finish')
}

main().catch(error => {
  log.error(error.message, error)
  process.exit(1)
})
