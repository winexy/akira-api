import {Inject, Injectable} from '@nestjs/common'
import {TaskModel, TaskT, CreateTaskDto, TasksQueryFiltersT} from './task.model'
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

  findAllByUID(uid: UID, {is_today, ...params}: TasksQueryFiltersT) {
    const query = this.taskModel
      .query()
      .where({
        author_uid: uid,
        ...params
      })
      .withGraphFetched('[checklist, tags]')

    if (is_today) {
      query.andWhereBetween('created_at', [
        this.taskModel.raw('CURRENT_DATE'),
        this.taskModel.raw('CURRENT_DATE + 1')
      ])
    }

    return query
  }

  findTodayTasksByUID(uid: UID) {
    return this.taskModel
      .query()
      .where({author_uid: uid})
      .whereBetween('created_at', [
        this.taskModel.raw('CURRENT_DATE'),
        this.taskModel.raw('CURRENT_DATE + 1')
      ])
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
        .withGraphFetched('[checklist, tags]')
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
        .withGraphFetched('[checklist, tags]')
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
