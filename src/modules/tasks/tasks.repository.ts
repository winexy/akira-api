import {Inject, Injectable} from '@nestjs/common'
import {TaskModel, TaskT} from './task.model'
import {CreateTaskDto} from './create-task.dto'
import {left, right} from '@sweet-monads/either'

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

  async findOne(
    taskId: TaskT['id'],
    uid: UserRecord['uid']
  ): EitherP<DBException, TaskT> {
    try {
      const task = await this.taskModel
        .query()
        .findOne('id', taskId)
        .where({
          author_uid: uid
        })
        .throwIfNotFound()

      return right(task)
    } catch (error) {
      return left(error)
    }
  }

  async update(
    id: TaskT['id'],
    uid: UserRecord['uid'],
    patch: Partial<TaskT>
  ): EitherP<DBException, TaskT> {
    try {
      const task = await this.taskModel
        .query()
        .where({author_uid: uid})
        .patchAndFetchById(id, patch)
        .throwIfNotFound()

      return right(task)
    } catch (error) {
      return left(error)
    }
  }

  async deleteOne(
    taskId: TaskT['id'],
    uid: UserRecord['uid']
  ): EitherP<DBException, boolean> {
    try {
      const count = await this.taskModel
        .query()
        .deleteById(taskId)
        .where({
          author_uid: uid
        })
        .throwIfNotFound()

      return right(count !== 0)
    } catch (error) {
      return left(error)
    }
  }
}
