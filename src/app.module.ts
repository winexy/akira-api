import {Module} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {ConfigModule} from '@nestjs/config'
import {
  ObjectionModule,
  ObjectionModuleOptions
} from '@willsoto/nestjs-objection'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {TasksModule} from './modules/tasks/tasks.module'
import {ChecklistModule} from './modules/checklist/checklist.module'
import {validateEnv} from './env.validation'
import {ListsModule} from './modules/lists/lists.module'
import {TagsModule} from './modules/tags/tags.module'
import {TaskSchedulerModule} from './modules/task-scheduler/task-scheduler.module'
import {ReportsModule} from './modules/reports/reports.module'

const objectionOptions: ObjectionModuleOptions = {
  config: {
    client: 'pg',
    useNullAsDefault: true,
    connection: {
      database: process.env.POSTGRES_DB,
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    },
    migrations: {
      tableName: 'migrations'
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv
    }),
    ObjectionModule.register(objectionOptions),
    ScheduleModule.forRoot(),
    TasksModule,
    ChecklistModule,
    ListsModule,
    TagsModule,
    TaskSchedulerModule,
    ReportsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
