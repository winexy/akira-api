import {Injectable} from '@nestjs/common'
import {CreateTaskListDto} from './task-list.model'
import {TaskListRepo} from './task-lists.repository'

@Injectable()
export class TaskListsService {
  constructor(private readonly taskListRepo: TaskListRepo) {}

  createTaskList(uid: UID, dto: CreateTaskListDto) {
    return this.taskListRepo.createTaskList(uid, dto)
  }
}
