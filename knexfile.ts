import {readFileSync} from 'fs'
import {join} from 'path'
import * as dotenv from 'dotenv'
import {validateEnv} from './src/env.validation'

function readCert() {
  try {
    return readFileSync(join(__dirname, 'ca-certificate.crt'))
  } catch (error) {
    console.error('[knexfile] Failed to load ssl certificate')
    throw error
  }
}

function readENV() {
  try {
    return validateEnv(process.env)
  } catch (error) {
    dotenv.config({path: '.env'})
    dotenv.config({path: '.env.postgres'})

    return validateEnv(process.env)
  }
}

const env = readENV()

module.exports = {
  client: 'pg',
  connection: {
    host: env.POSTGRES_HOST,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    port: env.POSTGRES_PORT,
    ssl: env.NODE_ENV === 'production' ? {ca: readCert()} : env.POSTGRES_SSL
  },
  migrations: {
    table: 'migrations',
    directory: './src/migrations',
    extension: 'ts'
  }
}
