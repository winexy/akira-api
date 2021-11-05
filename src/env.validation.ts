import {f, fmap, Infer, oneOf, required, run, string} from '@winexy/fuji'
import {OneOfType} from '@winexy/fuji/dist/rules/one-of'
import {RequiredType} from '@winexy/fuji/dist/rules/required'
import {map} from 'lodash'

const envTypes = ['development', 'production'] as const

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type EnvTypes = Mutable<typeof envTypes>[number]

const schema = f.shape({
  NODE_ENV: f<RequiredType | OneOfType, EnvTypes>(
    required(),
    oneOf(envTypes as Mutable<typeof envTypes>)
  ),
  PORT: f(
    string(),
    required(),
    fmap(s => parseInt(s))
  ),
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
  ),
  SUPERUSER_UID: f(string(), required())
})

export type AppConfig = Infer<typeof schema>

export function validateEnv(config: Record<string, string | undefined>) {
  const result = run(schema, config, {
    valueName: 'env schema',
    allowUnknown: true
  })

  if (result.invalid) {
    throw new Error(map(result.errors, 'message').join('\n'))
  }

  return result.value
}
