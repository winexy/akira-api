import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {TasksModule} from './tasks/tasks.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    }),
    TasksModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
