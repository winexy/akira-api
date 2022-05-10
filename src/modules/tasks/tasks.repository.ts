import {Inject, Injectable, Logger} from '@nestjs/common'
import {Model, QueryBuilder, Transaction} from 'objection'
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
import {TodoT, ChecklistModel} from '../checklist/checklist.model'
import {TaskTag} from './tasks-tags.model'
import {ScheduledTask} from '../task-scheduler/scheduled-task.model'
import {transformRejectReason} from '../../shared/transform-reject-reason'
import {UserError} from '../../filters/user-error.exception.filter'
import {Recurrence} from '../recurrence/recurrence.model'
import {formatISO} from 'date-fns'
import {isUndefined} from 'lodash'

export type DefaultFetchedTaskGraph = TaskT & {
  checklist: Array<TodoT>
  tags: Array<TaskTag>
  list: Array<TaskList>
  schedule: ScheduledTask | null
  recurrence: Recurrence | null
}

export type UserTaskCountMeta = {
  user_id: string
  tasks_count: string
}

@Injectable()
export class TasksRepo {
  private readonly logger = new Logger(TasksRepo.name)

  constructor(
    @Inject(TaskModel) private readonly model: typeof TaskModel,
    private readonly tasksTagsRepo: TasksTagsRepo
  ) {}

  static DEFAULT_FETCH_GRAPH = {
    checklist: {
      $modify: [ChecklistModel.modifiers.ordered.name]
    },
    tags: true,
    list: true,
    recurrence: true
  }

  static GetFetchGraph(
    graph: Partial<{
      checklist: true
      tags: true
      list: true
      recurrence: true
    }> = {}
  ) {
    return graph
  }

  Create(uid: UID, taskDto: CreateTaskDto) {
    return TE.tryCatch(() => {
      const {task: taskInfo, meta} = taskDto
      const tagsIds = meta?.tags || []

      return this.model.transaction(async trx => {
        const task = await this.InsertNewTask(trx)({
          title: taskInfo.title,
          description: taskInfo?.description,
          due_date: taskInfo.due_date,
          list_id: meta.list_id,
          author_uid: uid,
          date: meta.date
        })

        this.logger.log('task created', `TaskId(${task.id})`)

        const promises: Array<QueryBuilder<Model, unknown>> = []

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
      return this.model.query(trx).insert(dto).returning('id')
    }
  }

  FindAllByUID(uid: UID, {is_today, ...params}: TasksQueryFiltersT) {
    const query = this.model
      .query()
      .where({
        author_uid: uid,
        ...params
      })
      .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
      .orderBy('created_at', 'DESC')

    if (is_today) {
      query.andWhereBetween('created_at', [
        this.model.raw('CURRENT_DATE'),
        this.model.raw('CURRENT_DATE + 1')
      ])
    }

    return query
  }

  FindOne(uid: UserRecord['uid']) {
    return (taskId: TaskT['id']) => {
      return taskEitherQuery(() => {
        return this.model
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
    return this.model
      .query()
      .where('author_uid', uid)
      .andWhereRaw('LOWER("title") LIKE ?', `%${query.toLowerCase()}%`)
  }

  FindAllByIds(taskIds: Array<TaskId>, trx: Transaction) {
    return this.model.query(trx).whereIn('id', taskIds)
  }

  Update(trx?: Transaction) {
    return (
      id: TaskT['id'],
      uid: UserRecord['uid'],
      patch: Partial<TaskT>
    ): TE.TaskEither<UserError, TaskT> => {
      return taskEitherQuery(() => {
        return this.model
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
    return this.model.query().findById(id).where({author_uid: uid}).patch(patch)
  }

  InternalPatchTask(trx?: Transaction) {
    return (id: TaskT['id'], patch: Partial<TaskT>) => {
      return taskEitherQuery(() => {
        return this.model.query(trx).where('id', id).update(patch)
      })
    }
  }

  DeleteOne(
    taskId: TaskT['id'],
    uid: UserRecord['uid']
  ): TE.TaskEither<UserError, boolean> {
    return pipe(
      taskEitherQuery(() => {
        return this.model
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
    return this.model
      .query()
      .where('author_uid', uid)
      .andWhereRaw('CAST(updated_at AS DATE) = CAST(:date AS DATE)', {date})
  }

  InternalFindOne(trx?: Transaction) {
    return (id: TaskId): TE.TaskEither<UserError, TaskT> => {
      return taskEitherQuery(() => {
        return this.model.query(trx).findById(id).throwIfNotFound()
      })
    }
  }

  InsertClonedTask(trx?: Transaction) {
    return (dto: InsertClonedTaskDto) => {
      return taskEitherQuery(() => {
        return this.model.query(trx).insert(dto).returning('*')
      })
    }
  }

  FindUserTasksByDate(trx?: Transaction) {
    return (uid: UID, date: string): TE.TaskEither<UserError, Array<TaskT>> => {
      return taskEitherQuery(() => {
        return this.model
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
        return this.model
          .query(trx)
          .where('author_uid', uid)
          .andWhere('date', '>=', weekStart)
          .andWhere('date', '<=', weekEnd)
          .withGraphFetched(TasksRepo.DEFAULT_FETCH_GRAPH)
      })
    }
  }

  FindSharedWeekTasks(trx?: Transaction) {
    return (
      uid: UID,
      weekStart: string,
      weekEnd: string
    ): TE.TaskEither<UserError, Array<TaskT>> => {
      return taskEitherQuery(() => {
        return this.model
          .query(trx)
          .withGraphJoined({
            ...TasksRepo.DEFAULT_FETCH_GRAPH,
            shared: true
          })
          .where('shared.user_id', uid)
          .andWhere('date', '>=', weekStart)
          .andWhere('date', '<=', weekEnd)
      })
    }
  }

  FindByDate(trx?: Transaction) {
    return (uid: UID, date: string) => {
      return taskEitherQuery(() => {
        return this.model
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
      return this.model
        .query(trx)
        .where('is_completed', false)
        .andWhereNot('due_date', null)
        .andWhere('date', '<=', formatISO(new Date()))
    })
  }

  CountTodaySharedTasksByUsers(
    trx?: Transaction
  ): TE.TaskEither<UserError, Array<UserTaskCountMeta>> {
    /*
    Why "raw" knex query?
    
    For some reason Objection model 
    can't remove shared_tasks.id and tasks.id columns 
    from "select" clause while withGraphJoined method called

    This behavior leads to issue that we need to add id columns 
    to group by and that breaks main reason why this query exists
    */
    return taskEitherQuery(() => {
      const knexQuery = this.model.knexQuery()

      if (!isUndefined(trx)) {
        knexQuery.transacting(trx)
      }

      return knexQuery
        .select('shared_tasks.user_id')
        .count('shared_tasks.user_id', {as: 'tasks_count'})
        .from('shared_tasks')
        .where('date', formatISO(new Date()))
        .leftJoin('tasks', join => {
          join.on('tasks.id', 'shared_tasks.task_id')
        })
        .groupBy('shared_tasks.user_id')
    })
  }

  CountTodayTasksByUsers(
    trx?: Transaction
  ): TE.TaskEither<UserError, Array<UserTaskCountMeta>> {
    return taskEitherQuery(async () => {
      return (this.model
        .query(trx)
        .select(this.model.ref('author_uid').as('user_id'))
        .count('author_uid', {as: 'tasks_count'})
        .where('date', formatISO(new Date()))
        .groupBy('author_uid') as unknown) as Promise<Array<UserTaskCountMeta>>
    })
  }

  FindSharedTasksByDate(trx?: Transaction) {
    return (uid: UID, date: string): TE.TaskEither<UserError, Array<TaskT>> => {
      return taskEitherQuery(() => {
        return this.model
          .query(trx)
          .withGraphJoined({
            ...TasksRepo.DEFAULT_FETCH_GRAPH,
            shared: true
          })
          .where('date', date)
          .where('shared.user_id', uid)
      })
    }
  }
}
