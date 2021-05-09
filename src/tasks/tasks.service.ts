import {Injectable} from '@nestjs/common'
import {TasksRepo} from './tasks.repository'
import {CreateTaskDto} from './create-task.dto'

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepo: TasksRepo) {}

  create(taskDto: CreateTaskDto) {
    return this.tasksRepo.create(taskDto)
  }

  findAllByUID(uid: UserRecord['uid']) {
    return this.tasksRepo.findAllByUID(uid)
  }
}
