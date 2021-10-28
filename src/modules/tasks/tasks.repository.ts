import {Inject, Injectable, Logger} from '@nestjs/common'
import {Transaction} from 'objection'
import {isEmpty} from 'lodash/fp'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  TaskModel,
  TaskT,
  CreateTaskDto,
  TasksQueryFiltersT,
  TaskId
} from './task.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {TaskList} from '../lists/list.model'
import {TodoT} from '../checklist/checklist.model'
import {TaskTag} from './tasks-tags.model'
import {ScheduledTask} from '../task-scheduler/scheduled-task.model'
import {ScheduledTaskRepo} from '../task-scheduler/scheduled-task.repo'
import {
  RejectedQueryError,
  transformRejectReason
} from '../../shared/transform-reject-reason'
import {pipe} from 'fp-ts/lib/function'

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
    private readonly tasksTagsRepo: TasksTagsRepo,
    private readonly scheduledTaskRepo: ScheduledTaskRepo
  ) {}

  static DEFAULT_FETCH_GRAPH = {
    checklist: true,
    tags: true,
    list: true,
    schedule: true
  }

  create(uid: UID, taskDto: CreateTaskDto) {
    return TE.tryCatch(() => {
      const {task: taskInfo, meta} = taskDto
      const tagsIds = meta?.tags || []

      return this.taskModel.transaction(async trx => {
        const task = await this.taskModel
          .query(trx)
          .insert({
            title: taskInfo.title,
            description: taskInfo?.description,
            list_id: meta.list_id,
            author_uid: uid
          })
          .returning('id')

        this.logger.log('task created', `TaskId(${task.id})`)

        const promises: Array<Promise<unknown>> = []

        if (!isEmpty(tagsIds)) {
          this.logger.log('add tags to task')
          promises.push(this.tasksTagsRepo.addTags(task.id, tagsIds, trx))
        }

        promises.push(
          this.scheduledTaskRepo.create(
            {
              date: meta.date,
              task_id: task.id
            },
            trx
          )()
        )

        await Promise.all(promises)

        this.logger.log('all task meta created successfully')

        return task.id
      })
    }, transformRejectReason)
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

  findOne(uid: UserRecord['uid']) {
    return (taskId: TaskT['id']) => {
      return TE.tryCatch<DBException, TaskT>(() => {
        return this.taskModel
          .query()
          .findOne('id', taskId)
          .where({
            author_uid: uid
          })
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
          .throwIfNotFound()
      }, transformRejectReason)
    }
  }

  search(uid: UID, query: string) {
    return this.taskModel
      .query()
      .where('author_uid', uid)
      .andWhereRaw('LOWER("title") LIKE ?', `%${query.toLowerCase()}%`)
  }

  findAllByIds(taskIds: Array<TaskId>, trx: Transaction) {
    return this.taskModel.query(trx).whereIn('id', taskIds)
  }

  update(
    id: TaskT['id'],
    uid: UserRecord['uid'],
    patch: Partial<TaskT>
  ): TE.TaskEither<RejectedQueryError, TaskT> {
    return TE.tryCatch(() => {
      return this.taskModel
        .query()
        .where({author_uid: uid})
        .patchAndFetchById(id, patch)
        .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
        .throwIfNotFound()
    }, transformRejectReason)
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

  deleteOne(
    taskId: TaskT['id'],
    uid: UserRecord['uid']
  ): TE.TaskEither<DBException, boolean> {
    return pipe(
      TE.tryCatch(() => {
        return this.taskModel
          .query()
          .deleteById(taskId)
          .where({
            author_uid: uid
          })
          .throwIfNotFound()
      }, transformRejectReason),
      TE.map(count => count !== 0)
    )
  }

  async addToList(taskId: TaskId, uid: UID, listId: TaskList['id']) {
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
