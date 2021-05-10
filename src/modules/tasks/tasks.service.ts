import {Injectable} from '@nestjs/common'
import {TasksRepo} from './tasks.repository'
import {CreateTaskDto} from './create-task.dto'
import {TaskT} from './task.model'

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepo: TasksRepo) {}

  create(taskDto: CreateTaskDto) {
    return this.tasksRepo.create(taskDto)
  }

  findAllByUID(uid: UserRecord['uid']) {
    return this.tasksRepo.findAllByUID(uid)
  }

  findOne(taskId: TaskT['id'], uid: UserRecord['uid']) {
    return this.tasksRepo.findOne(taskId, uid)
  }

  async toggleCompleted(taskId: TaskT['id'], uid: UserRecord['uid']) {
    const result = await this.findOne(taskId, uid)

    return result.asyncChain(task =>
      this.tasksRepo.update(taskId, uid, {
        is_completed: !task.is_completed
      })
    )
  }

  async toggleImportant(taskId: TaskT['id'], uid: UserRecord['uid']) {
    const result = await this.findOne(taskId, uid)

    return result.asyncChain(task =>
      this.tasksRepo.update(taskId, uid, {
        is_important: !task.is_important
      })
    )
  }

  deleteOne(taskId: TaskT['id'], uid: UserRecord['uid']) {
    return this.tasksRepo.deleteOne(taskId, uid)
  }
}
