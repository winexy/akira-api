import {$} from 'zx'
import {logger} from './tools/logger'

const log = logger('prestart')

async function main() {
  log.success('start')
  await $`knex migrate:latest`
  log.success('finish')
}

main().catch(error => {
  log.error(error.message, error)
  process.exit(1)
})
