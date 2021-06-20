import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TaskListsController} from './task-lists.controller'
import {TaskListsService} from './task-lists.service'
import {TaskListModel} from './task-list.model'
import {TaskListRepo} from './task-lists.repository'

@Module({
  imports: [ObjectionModule.forFeature([TaskListModel])],
  controllers: [TaskListsController],
  providers: [TaskListsService, TaskListRepo]
})
export class TaskListsModule {}
