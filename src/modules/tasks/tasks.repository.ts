import {Inject, Injectable} from '@nestjs/common'
import {Transaction} from 'objection'
import {left, right} from '@sweet-monads/either'
import {isEmpty, isNumber} from 'lodash/fp'
import {
  TaskModel,
  TaskT,
  CreateTaskDto,
  TasksQueryFiltersT,
  TaskIdT
} from './task.model'
import {TasksTagsRepo} from './tasks-tags.repository'

@Injectable()
export class TasksRepo {
  constructor(
    @Inject(TaskModel) private readonly taskModel: typeof TaskModel,
    private readonly tasksTagsRepo: TasksTagsRepo
  ) {}

  static DEFAULT_FETCH_GRAPH = {
    checklist: true,
    tags: true,
    list: true,
    schedule: true
  }

  create(uid: UID, taskDto: CreateTaskDto) {
    const {title, meta} = taskDto
    const tagsIds = meta?.tags || []
    const listId = meta?.list_id

    return this.taskModel.transaction(async trx => {
      const task = await this.taskModel
        .query(trx)
        .insert({
          title,
          author_uid: uid
        })
        .returning('id')

      const promises: Array<Promise<unknown>> = []

      if (!isEmpty(tagsIds)) {

        promises.push(this.tasksTagsRepo.addTags(task.id, tagsIds, trx))
      }

      if (isNumber(listId)) {
        promises.push(
          this.update(task.id, uid, {
            list_id: listId
          })
        )
      }

      await Promise.all(promises)

      return task.id
    })
  }

  findAllByUID(uid: UID, {is_today, ...params}: TasksQueryFiltersT) {
    const query = this.taskModel
      .query()
      .where({
        author_uid: uid,
        ...params
      })
      .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
      .orderBy('created_at', 'DESC')

    if (is_today) {
      query.andWhereBetween('created_at', [
        this.taskModel.raw('CURRENT_DATE'),
        this.taskModel.raw('CURRENT_DATE + 1')
      ])
    }

    return query
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
        .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
        .throwIfNotFound()

      return right(task)
    } catch (error) {
      return left(error)
    }
  }

  search(uid: UID, query: string) {
    return this.taskModel
      .query()
      .where('author_uid', uid)
      .andWhereRaw('LOWER("title") LIKE ?', `%${query.toLowerCase()}%`)
  }

  findAllByIds(taskIds: Array<TaskIdT>, trx: Transaction) {
    return this.taskModel.query(trx).whereIn('id', taskIds)
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
        .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
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
