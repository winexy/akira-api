import {forwardRef, Module} from '@nestjs/common'
import {TasksController} from './tasks.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TaskModel} from './task.model'
import {TasksRepo} from './tasks.repository'
import {TasksService} from './tasks.service'
import {TasksTagsModel} from './tasks-tags.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {MyDayModule} from '../myday/myday.module'

@Module({
  imports: [
    ObjectionModule.forFeature([TaskModel, TasksTagsModel]),
    forwardRef(() => MyDayModule)
  ],
  providers: [TasksRepo, TasksService, TasksTagsRepo],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule {}
