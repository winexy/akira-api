import {readFileSync} from 'fs'
import path from 'path'
import {Module} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {TasksModule} from './modules/tasks/tasks.module'
import {ChecklistModule} from './modules/checklist/checklist.module'
import {validateEnv} from './env.validation'
import {ListsModule} from './modules/lists/lists.module'
import {TagsModule} from './modules/tags/tags.module'
import {TaskSchedulerModule} from './modules/task-scheduler/task-scheduler.module'
import {ReportsModule} from './modules/reports/reports.module'
import {RecurrenceModule} from './modules/recurrence/recurrence.module'

function loadCertificate() {
  try {
    return readFileSync(path.join(__dirname, '..', 'ca-certificate.crt'))
  } catch (error) {
    console.error('[AppModule] Failed to load ssl certificate')
    throw error
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv
    }),
    ObjectionModule.registerAsync({
      imports: [ConfigModule.forRoot({validate: validateEnv})],
      inject: [ConfigService],
      useFactory(config: AppConfigService) {
        const ssl =
          config.get('NODE_ENV') === 'production'
            ? {ca: loadCertificate()}
            : (config.get('POSTGRES_SSL') as boolean)

        return {
          config: {
            client: 'pg',
            useNullAsDefault: true,
            connection: {
              database: config.get('POSTGRES_DB'),
              host: config.get('POSTGRES_HOST'),
              user: config.get('POSTGRES_USER'),
              password: config.get('POSTGRES_PASSWORD'),
              port: config.get('POSTGRES_PORT'),
              ssl
            },
            migrations: {
              tableName: 'migrations'
            }
          }
        }
      }
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    ChecklistModule,
    ListsModule,
    TagsModule,
    TaskSchedulerModule,
    ReportsModule,
    RecurrenceModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
