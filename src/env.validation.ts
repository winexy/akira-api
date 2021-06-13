import {fuji, oneOf, required, runWith, shape} from '@winexy/fuji'

const envTypes = ['development', 'production']

const schema = fuji(
  shape({
    NODE_ENV: fuji(required(), oneOf(envTypes)),
    PORT: fuji(required()),
    POSTGRES_HOST: fuji(required()),
    POSTGRES_PASSWORD: fuji(required()),
    POSTGRES_USER: fuji(required()),
    POSTGRES_DB: fuji(required())
  })
)

export function validateEnv(config: Record<string, string>) {
  const errors = runWith(schema, config)

  if (errors.length > 0) {
    throw new Error(errors.map(error => error.message).join('\n'))
  }

  return config
}
