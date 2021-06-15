import {ConfigService} from '@nestjs/config'
import {AppConfig} from 'src/env.validation'

declare global {
  export type AppConfigService = ConfigService<AppConfig>
}
