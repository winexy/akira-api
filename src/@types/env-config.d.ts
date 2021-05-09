import {ConfigService} from '@nestjs/config'

declare global {
  export type AppConfig = {
    PORT: string
    POSTGRES_HOST: string
    POSTGRES_PASSWORD: string
    POSTGRES_USER: string
    POSTGRES_DB: string
  }

  export type AppConfigService = ConfigService<AppConfig>
}
