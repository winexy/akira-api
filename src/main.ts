import {ConfigService} from '@nestjs/config'
import {NestFactory} from '@nestjs/core'
import firebase, {ServiceAccount} from 'firebase-admin'
import {AppModule} from './app.module'
import * as serviceAccount from '../firebase-service-account.json'
import {DbExceptionFilter} from './filters/db-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<AppConfigService>(ConfigService)
  const port = config.get('PORT', 3000)

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount as ServiceAccount)
  })

  app.enableCors()
  app.useGlobalFilters(new DbExceptionFilter(config))

  await app.listen(port)

  global.console.log(`💫 Application Started on port ${port}`)
}

bootstrap()
