import {Module} from '@nestjs/common'
import {TasksController} from './tasks.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TaskModel} from './task.model'
import {TasksRepo} from './tasks.repository'
import {TasksService} from './tasks.service'
import {TasksTagsModel} from './tasks-tags.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {TaskSchedulerModule} from '../task-scheduler/task-scheduler.module'
import {DueDateWorker} from './due-date.worker'
import {ScheduledTasksPushWorker} from './scheduled-tasks-push.worker'
import {UsersModule} from '../users/users.module'

@Module({
  imports: [
    ObjectionModule.forFeature([TaskModel, TasksTagsModel]),
    TaskSchedulerModule,
    UsersModule
  ],
  providers: [
    TasksRepo,
    TasksService,
    TasksTagsRepo,
    DueDateWorker,
    ScheduledTasksPushWorker
  ],
  controllers: [TasksController],
  exports: [TasksService, TasksRepo]
})
export class TasksModule {}
