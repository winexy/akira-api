import {forwardRef, Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TasksModule} from '../tasks/tasks.module'
import {TaskSchedulerController} from './task-scheduler.controller'
import {ScheduledTaskModel} from './scheduled-task.model'

@Module({
  imports: [
    ObjectionModule.forFeature([ScheduledTaskModel]),
    forwardRef(() => TasksModule)
  ],
  controllers: [TaskSchedulerController],
  providers: [],
  exports: []
})
export class TaskSchedulerModule {}
