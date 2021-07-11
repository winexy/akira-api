import {forwardRef, Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TasksModule} from '../tasks/tasks.module'
import {TaskSchedulerService} from './task-scheduler.service'
import {TaskSchedulerController} from './task-scheduler.controller'
import {ScheduledTaskRepo} from './scheduled-task.repo'
import {ScheduledTaskModel} from './scheduled-task.model'

@Module({
  imports: [
    ObjectionModule.forFeature([ScheduledTaskModel]),
    forwardRef(() => TasksModule)
  ],
  controllers: [TaskSchedulerController],
  providers: [TaskSchedulerService, ScheduledTaskRepo],
  exports: [TaskSchedulerService, ScheduledTaskRepo]
})
export class TaskSchedulerModule {}
