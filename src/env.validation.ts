import {fuji, oneOf, required, runWith, shape} from '@winexy/fuji'

const envTypes = ['development', 'production']

const schema = fuji(
  shape({
    NODE_ENV: fuji(
      required('NODE_ENV is required'),
      oneOf(
        envTypes,
        `NODE_ENV must be one of ${envTypes.map(env => `"${env}"`).join(', ')}`
      )
    ),
    PORT: fuji(required('PORT is required')),
    POSTGRES_HOST: fuji(required('POSTGRES_HOST is required')),
    POSTGRES_PASSWORD: fuji(required('POSTGRES_PASSWORD is required')),
    POSTGRES_USER: fuji(required('POSTGRES_USER is required')),
    POSTGRES_DB: fuji(required('POSTGRES_DB is required'))
  })
)

export function validateEnv(config: Record<string, string>) {
  const errors = runWith(schema, config)

  if (errors.length > 0) {
    throw new Error(errors.map(error => error.message).join('\n'))
  }

  return config
}
