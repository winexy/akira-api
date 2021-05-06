import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {AppController} from './app.controller'
import {AppService} from './app.service'

@Module({
  imports: [
    ObjectionModule.register({
      config: {
        client: 'pg',
        useNullAsDefault: true,
        connection: {
          database: process.env.PG_DB,
          host: process.env.PG_HOST,
          user: process.env.PG_USER,
          password: process.env.PG_PASSWORD
        },
        migrations: {
          tableName: 'migrations'
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
