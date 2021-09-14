import {forwardRef, Module} from '@nestjs/common'
import {TasksController} from './tasks.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TaskModel} from './task.model'
import {TasksRepo} from './tasks.repository'
import {TasksService} from './tasks.service'
import {TasksTagsModel} from './tasks-tags.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {MyDayModule} from '../myday/myday.module'
import {TaskSchedulerModule} from '../task-scheduler/task-scheduler.module'

@Module({
  imports: [
    ObjectionModule.forFeature([TaskModel, TasksTagsModel]),
    forwardRef(() => MyDayModule),
    TaskSchedulerModule
  ],
  providers: [TasksRepo, TasksService, TasksTagsRepo],
  controllers: [TasksController],
  exports: [TasksService, TasksRepo]
})
export class TasksModule {}
