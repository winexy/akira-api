import {validateEnv} from './src/env.validation'

const env = validateEnv(process.env)

module.exports = {
  client: 'pg',
  connection: {
    host: env.POSTGRES_HOST,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    port: env.POSTGRES_PORT,
    ssl: env.POSTGRES_SSL
  },
  migrations: {
    table: 'migrations',
    directory: './src/migrations',
    extension: 'ts'
  }
}
