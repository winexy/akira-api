import {Inject, Injectable, Logger} from '@nestjs/common'
import {Transaction} from 'objection'
import {left, right} from '@sweet-monads/either'
import {isEmpty} from 'lodash/fp'
import {
  TaskModel,
  TaskT,
  CreateTaskDto,
  TasksQueryFiltersT,
  TaskIdT
} from './task.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {TaskList} from '../lists/list.model'
import {TodoT} from '../checklist/checklist.model'
import {TaskTag} from './tasks-tags.model'
import {ScheduledTask} from '../task-scheduler/scheduled-task.model'

export type DefaultFetchedTaskGraph = TaskT & {
  checklist: Array<TodoT>
  tags: Array<TaskTag>
  list: Array<TaskList>
  schedule: ScheduledTask
}

@Injectable()
export class TasksRepo {
  private readonly logger = new Logger(TasksRepo.name)

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
    const {task: taskInfo, meta} = taskDto
    const tagsIds = meta?.tags || []

    return this.taskModel.transaction(async trx => {
      const task = await this.taskModel
        .query(trx)
        .insert({
          title: taskInfo.title,
          description: taskInfo?.description,
          author_uid: uid
        })
        .returning('id')

      this.logger.log('task created', `TaskId(${task.id})`)

      const promises: Array<Promise<unknown>> = []

      if (!isEmpty(tagsIds)) {
        this.logger.log('add tags to task')
        promises.push(this.tasksTagsRepo.addTags(task.id, tagsIds, trx))
      }

      await Promise.all(promises)

      this.logger.log('all task meta created successfully')

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

  private patch(
    id: TaskT['id'],
    uid: UserRecord['uid'],
    patch: Partial<TaskT>
  ) {
    return this.taskModel
      .query()
      .findById(id)
      .where({author_uid: uid})
      .patch(patch)
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

  async addToList(taskId: TaskIdT, uid: UID, listId: TaskList['id']) {
    this.logger.log('add task to list', {
      task_id: taskId,
      list_id: listId
    })

    try {
      await this.patch(taskId, uid, {list_id: listId})
    } catch (error) {
      this.logger.error('failed to add to list', error.stack, {
        errorMessage: error.message
      })
    }
  }

  findByUpdatedDate(uid: UID, date: string) {
    return this.taskModel
      .query()
      .where('author_uid', uid)
      .andWhereRaw('CAST(updated_at AS DATE) = CAST(:date AS DATE)', {date})
  }
}
