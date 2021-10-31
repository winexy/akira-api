module.exports = {
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.POSTGRES_SSL
  },
  migrations: {
    table: 'migrations',
    directory: './src/migrations',
    extension: 'ts'
  }
}
