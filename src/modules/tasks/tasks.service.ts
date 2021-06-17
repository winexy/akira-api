import {Injectable} from '@nestjs/common'
import {TasksRepo} from './tasks.repository'
import {TaskIdT, TaskPatchT, TaskT, CreateTaskDto} from './task.model'

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepo: TasksRepo) {}

  create(taskDto: CreateTaskDto) {
    return this.tasksRepo.create(taskDto)
  }

  findAllByUID(uid: UID) {
    return this.tasksRepo.findAllByUID(uid)
  }

  findTodayTasksByUID(uid: UID) {
    return this.tasksRepo.findTodayTasksByUID(uid)
  }

  findOne(taskId: TaskIdT, uid: UID) {
    return this.tasksRepo.findOne(taskId, uid)
  }

  async toggleCompleted(taskId: TaskIdT, uid: UID) {
    const result = await this.findOne(taskId, uid)

    return result.asyncChain(task =>
      this.tasksRepo.update(taskId, uid, {
        is_completed: !task.is_completed
      })
    )
  }

  async toggleImportant(taskId: TaskIdT, uid: UID) {
    const result = await this.findOne(taskId, uid)

    return result.asyncChain(task =>
      this.tasksRepo.update(taskId, uid, {
        is_important: !task.is_important
      })
    )
  }

  deleteOne(taskId: TaskIdT, uid: UID) {
    return this.tasksRepo.deleteOne(taskId, uid)
  }

  async ensureAuthority(taskId: TaskIdT, uid: UID): EitherP<DBException, true> {
    const res = await this.findOne(taskId, uid)
    return res.map(() => true)
  }

  patchTask(
    uid: UID,
    taskId: TaskIdT,
    patch: TaskPatchT
  ): EitherP<DBException, TaskT> {
    return this.tasksRepo.update(taskId, uid, patch)
  }
}
