import {Module} from '@nestjs/common'
import {TasksController} from './tasks.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TaskModel} from './task.model'
import {TasksRepo} from './tasks.repository'
import {TasksService} from './tasks.service'
import {TasksTagsModel} from './task-tags.model'
import {TasksTagsRepo} from './task-tags.repository'

@Module({
  imports: [ObjectionModule.forFeature([TaskModel, TasksTagsModel])],
  providers: [TasksRepo, TasksService, TasksTagsRepo],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule {}
