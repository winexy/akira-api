import {Inject, Injectable} from '@nestjs/common'
import {TaskListModel} from './task-list.model'

@Injectable()
export class TaskListRepo {
  constructor(
    @Inject(TaskListModel)
    private readonly taskListModel: typeof TaskListModel
  ) {}
}
