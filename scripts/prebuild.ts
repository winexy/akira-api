import {$} from 'zx'
import {logger} from './tools/logger'
import {writeFileFromENV} from './tools/write-file-from-env'

const log = logger('prebuild')

async function main() {
  log.success('start')

  await $`rimraf dist`

  await writeFileFromENV({
    scope: 'firebase-config',
    variable: 'FIREBASE_SERVICE_ACCOUNT_JSON',
    fileName: 'firebase-service-account.json'
  })

  log.success('finish')
}

main().catch(error => {
  log.error(error.message, error)
  process.exit(1)
})
