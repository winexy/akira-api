import {ConfigService} from '@nestjs/config'
import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {DbExceptionFilter} from './filters/db-exception.filter'
import {UserErrorFilter} from './filters/user-error.exception.filter'
import {AppConfig} from './env.validation'
import {initializeApp} from './firebase'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<AppConfigService>(ConfigService)
  const port = config.get<AppConfig['PORT']>('PORT', 3000)

  initializeApp()

  app.enableCors()
  app.useGlobalFilters(new DbExceptionFilter(config), new UserErrorFilter())

  await app.listen(port)

  global.console.log(`💫 Application Started on port ${port}`)
}

bootstrap()
