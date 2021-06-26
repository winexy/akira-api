import {ConfigService} from '@nestjs/config'
import {NestFactory} from '@nestjs/core'
import firebase, {ServiceAccount} from 'firebase-admin'
import {AppModule} from './app.module'
import * as serviceAccount from '../firebase-service-account.json'
import {DbExceptionFilter} from './filters/db-exception.filter'
import {UserErrorFilter} from './filters/user-error.exception.filter'
import {AppConfig} from './env.validation'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<AppConfigService>(ConfigService)
  const port = config.get<AppConfig['PORT']>('PORT', 3000)

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount as ServiceAccount)
  })

  app.enableCors()
  app.useGlobalFilters(new DbExceptionFilter(config), new UserErrorFilter())

  await app.listen(port)

  global.console.log(`💫 Application Started on port ${port}`)
}

bootstrap()
