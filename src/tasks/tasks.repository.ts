import {Inject, Injectable} from '@nestjs/common'
import {TaskModel, TaskT} from './task.model'
import {CreateTaskDto} from './create-task.dto'

@Injectable()
export class TasksRepo {
  constructor(
    @Inject(TaskModel) private readonly taskModel: typeof TaskModel
  ) {}

  create(taskDto: CreateTaskDto) {
    return this.taskModel.transaction(trx => {
      return this.taskModel.query(trx).insert(taskDto).returning('*')
    })
  }

  findAllByUID(uid: UserRecord['uid']) {
    return this.taskModel.query().where({
      author_uid: uid
    })
  }

  findOne(taskId: TaskT['id'], uid: UserRecord['uid']) {
    return this.taskModel.query().findOne('id', taskId).where({
      author_uid: uid
    })
  }
}
