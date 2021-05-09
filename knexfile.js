module.exports = {
  client: 'pg',
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB
  },
  migrations: {
    table: 'migrations',
    directory: './src/migrations',
    extension: 'ts'
  }
}
