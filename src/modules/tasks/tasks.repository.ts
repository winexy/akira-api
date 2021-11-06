import {Inject, Injectable, Logger} from '@nestjs/common'
import {Transaction} from 'objection'
import {isEmpty} from 'lodash/fp'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {taskEitherQuery} from 'src/shared/task-either-query'
import {
  TaskModel,
  TaskT,
  CreateTaskDto,
  TasksQueryFiltersT,
  TaskId,
  InsertNewTaskDto,
  InsertClonedTaskDto
} from './task.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {TaskList} from '../lists/list.model'
import {TodoT} from '../checklist/checklist.model'
import {TaskTag} from './tasks-tags.model'
import {ScheduledTask} from '../task-scheduler/scheduled-task.model'
import {transformRejectReason} from '../../shared/transform-reject-reason'
import {UserError} from '../../filters/user-error.exception.filter'
import {Recurrence} from '../recurrence/recurrence.model'
import {formatISO} from 'date-fns'

export type DefaultFetchedTaskGraph = TaskT & {
  checklist: Array<TodoT>
  tags: Array<TaskTag>
  list: Array<TaskList>
  schedule: ScheduledTask | null
  recurrence: Recurrence | null
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
    recurrence: true
  }

  Create(uid: UID, taskDto: CreateTaskDto) {
    return TE.tryCatch(() => {
      const {task: taskInfo, meta} = taskDto
      const tagsIds = meta?.tags || []

      return this.taskModel.transaction(async trx => {
        const task = await this.InsertNewTask(trx)({
          title: taskInfo.title,
          description: taskInfo?.description,
          list_id: meta.list_id,
          author_uid: uid,
          date: meta.date
        })

        this.logger.log('task created', `TaskId(${task.id})`)

        const promises: Array<Promise<unknown>> = []

        if (!isEmpty(tagsIds)) {
          this.logger.log('add tags to task')
          promises.push(this.tasksTagsRepo.AddTags(task.id, tagsIds, trx))
        }

        await Promise.all(promises)

        this.logger.log('all task meta created successfully')

        return task.id
      })
    }, transformRejectReason)
  }

  private InsertNewTask(trx?: Transaction) {
    return (dto: InsertNewTaskDto) => {
      return this.taskModel.query(trx).insert(dto).returning('id')
    }
  }

  FindAllByUID(uid: UID, {is_today, ...params}: TasksQueryFiltersT) {
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

  FindOne(uid: UserRecord['uid']) {
    return (taskId: TaskT['id']) => {
      return taskEitherQuery(() => {
        return this.taskModel
          .query()
          .findOne('id', taskId)
          .where({
            author_uid: uid
          })
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
          .throwIfNotFound()
      })
    }
  }

  Search(uid: UID, query: string) {
    return this.taskModel
      .query()
      .where('author_uid', uid)
      .andWhereRaw('LOWER("title") LIKE ?', `%${query.toLowerCase()}%`)
  }

  FindAllByIds(taskIds: Array<TaskId>, trx: Transaction) {
    return this.taskModel.query(trx).whereIn('id', taskIds)
  }

  Update(trx?: Transaction) {
    return (
      id: TaskT['id'],
      uid: UserRecord['uid'],
      patch: Partial<TaskT>
    ): TE.TaskEither<UserError, TaskT> => {
      return taskEitherQuery(() => {
        return this.taskModel
          .query(trx)
          .where({author_uid: uid})
          .patchAndFetchById(id, patch)
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
          .throwIfNotFound()
      })
    }
  }

  private Patch(
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

  InternalPatchTask(trx?: Transaction) {
    return (id: TaskT['id'], patch: Partial<TaskT>) => {
      return taskEitherQuery(() => {
        return this.taskModel.query(trx).where('id', id).update(patch)
      })
    }
  }

  DeleteOne(
    taskId: TaskT['id'],
    uid: UserRecord['uid']
  ): TE.TaskEither<UserError, boolean> {
    return pipe(
      taskEitherQuery(() => {
        return this.taskModel
          .query()
          .deleteById(taskId)
          .where({
            author_uid: uid
          })
          .throwIfNotFound()
      }),
      TE.map(count => count !== 0)
    )
  }

  async AddToList(taskId: TaskId, uid: UID, listId: TaskList['id']) {
    this.logger.log('add task to list', {
      task_id: taskId,
      list_id: listId
    })

    try {
      await this.Patch(taskId, uid, {list_id: listId})
    } catch (error) {
      this.logger.error('failed to add to list', error.stack, {
        errorMessage: error.message
      })
    }
  }

  FindByUpdatedDate(uid: UID, date: string) {
    return this.taskModel
      .query()
      .where('author_uid', uid)
      .andWhereRaw('CAST(updated_at AS DATE) = CAST(:date AS DATE)', {date})
  }

  InternalFindOne(trx?: Transaction) {
    return (id: TaskId): TE.TaskEither<UserError, TaskT> => {
      return taskEitherQuery(() => {
        return this.taskModel.query(trx).findById(id).throwIfNotFound()
      })
    }
  }

  InsertClonedTask(trx?: Transaction) {
    return (dto: InsertClonedTaskDto) => {
      return taskEitherQuery(() => {
        return this.taskModel.query(trx).insert(dto).returning('*')
      })
    }
  }

  FindUserTasksByDate(trx?: Transaction) {
    return (uid: UID, date: string): TE.TaskEither<UserError, Array<TaskT>> => {
      return taskEitherQuery(() => {
        return this.taskModel
          .query(trx)
          .where('date', date)
          .andWhere('author_uid', uid)
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
      })
    }
  }

  FindWeekTasks(trx?: Transaction) {
    return (
      uid: UID,
      weekStart: string,
      weekEnd: string
    ): TE.TaskEither<UserError, Array<TaskT>> => {
      return taskEitherQuery(() => {
        return this.taskModel
          .query(trx)
          .where('author_uid', uid)
          .andWhere('date', '>=', weekStart)
          .andWhere('date', '<=', weekEnd)
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
      })
    }
  }

  FindByDate(trx?: Transaction) {
    return (uid: UID, date: string) => {
      return taskEitherQuery(() => {
        return this.taskModel
          .query(trx)
          .where('author_uid', uid)
          .andWhere('date', date)
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
      })
    }
  }

  FindRescheduableTasksWithDueDate(
    trx?: Transaction
  ): TE.TaskEither<UserError, TaskT[]> {
    return taskEitherQuery(() => {
      return this.taskModel
        .query(trx)
        .where('is_completed', false)
        .andWhereNot('due_date', null)
        .andWhere('date', '<=', formatISO(new Date()))
    })
  }
}
