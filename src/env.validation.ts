import {f, fmap, Infer, oneOf, required, run, string, Fuji} from '@winexy/fuji'
import {OneOfType} from '@winexy/fuji/dist/rules/one-of'
import {RequiredType} from '@winexy/fuji/dist/rules/required'
import {map} from 'lodash'

const envTypes = ['development', 'production'] as const

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type EnvTypes = Mutable<typeof envTypes>[number]

const nodeschema = {
  NODE_ENV: f<RequiredType | OneOfType, EnvTypes>(
    required(),
    oneOf(envTypes as Mutable<typeof envTypes>)
  )
}

const pgschema = {
  ...nodeschema,
  POSTGRES_HOST: f(string(), required()),
  POSTGRES_PASSWORD: f(string(), required()),
  POSTGRES_USER: f(string(), required()),
  POSTGRES_DB: f(string(), required()),
  POSTGRES_PORT: f(
    string(),
    required(),
    fmap(s => parseInt(s))
  ),
  POSTGRES_SSL: f(
    string(),
    oneOf(['true', 'false']),
    fmap(value => value === 'true')
  )
}

const appschema = f.shape({
  ...pgschema,
  ...nodeschema,
  PORT: f(
    string(),
    required(),
    fmap(s => parseInt(s))
  ),
  SUPERUSER_UID: f(string(), required()),
  TZ: f(string(), required()),
  USE_MOCK_AUTH: f(
    string(),
    fmap(s => s === 'true')
  )
})

export type AppConfig = Infer<typeof appschema>

function validateEnv<Shape extends Fuji<any, any>>(schema: Shape) {
  return (config: Record<string, string | undefined>): Infer<Shape> => {
    const result = run(schema, config, {
      valueName: 'env schema',
      allowUnknown: true
    })

    if (result.invalid) {
      throw new Error(map(result.errors, 'message').join('\n'))
    }

    return result.value
  }
}

export const validateAppEnv = validateEnv(appschema)
export const validatePGEnv = validateEnv(f.shape(pgschema))
