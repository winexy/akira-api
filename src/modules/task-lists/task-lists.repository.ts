import {Inject, Injectable} from '@nestjs/common'
import {CreateTaskListDto, TaskListModel} from './task-list.model'

@Injectable()
export class TaskListRepo {
  constructor(
    @Inject(TaskListModel)
    private readonly taskListModel: typeof TaskListModel
  ) {}

  createTaskList(uid: UID, dto: CreateTaskListDto) {
    return this.taskListModel.query().insert({
      ...dto,
      author_uid: uid
    })
  }
}
