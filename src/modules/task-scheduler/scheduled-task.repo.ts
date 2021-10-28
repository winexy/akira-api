import {Inject, Injectable} from '@nestjs/common'
import {isUndefined} from 'lodash'
import {TaskId, TaskModel} from '../tasks/task.model'
import {
  ScheduledTask,
  ScheduledTaskModel,
  ScheduleTaskDto
} from './scheduled-task.model'
import {Transaction} from 'objection'
import {TasksRepo, DefaultFetchedTaskGraph} from '../tasks/tasks.repository'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {transformRejectReason} from '../../shared/transform-reject-reason'
import {UserError} from 'src/filters/user-error.exception.filter'

type QueriedTask = ScheduledTask & {
  task: DefaultFetchedTaskGraph
}

@Injectable()
export class ScheduledTaskRepo {
  constructor(
    @Inject(ScheduledTaskModel)
    private readonly scheduledTaskModel: typeof ScheduledTaskModel
  ) {}

  create(dto: ScheduleTaskDto, trx?: Transaction) {
    return pipe(
      this.findScheduledTask(dto.task_id, trx),
      TE.chain(entity => {
        return isUndefined(entity)
          ? this.insertNewScheduledTask(dto, trx)
          : this.patchAlreadyScheduledTask(entity, dto, trx)
      })
    )
  }

  findScheduledTask(taskId: TaskId, trx?: Transaction) {
    return TE.tryCatch(() => {
      return this.scheduledTaskModel.query(trx).findOne('task_id', taskId)
    }, transformRejectReason)
  }

  insertNewScheduledTask(dto: ScheduleTaskDto, trx?: Transaction) {
    return TE.tryCatch(() => {
      return this.scheduledTaskModel.query(trx).insert({
        task_id: dto.task_id,
        date: dto.date
      })
    }, transformRejectReason)
  }

  patchAlreadyScheduledTask(
    entity: ScheduledTask,
    dto: ScheduleTaskDto,
    trx?: Transaction
  ) {
    return TE.tryCatch(() => {
      return this.scheduledTaskModel.query(trx).patchAndFetchById(entity.id, {
        date: dto.date
      })
    }, transformRejectReason)
  }

  delete(dto: ScheduleTaskDto) {
    return TE.tryCatch(() => {
      return this.scheduledTaskModel
        .query()
        .delete()
        .limit(1)
        .where('task_id', dto.task_id)
    }, transformRejectReason)
  }

  findByDate(date: string, trx: Transaction) {
    return this.scheduledTaskModel.query(trx).where({
      date
    })
  }

  findUserTasksByDate(
    uid: UID,
    date: string
  ): TE.TaskEither<UserError, Array<QueriedTask>> {
    return TE.tryCatch(() => {
      return (this.scheduledTaskModel
        .query()
        .where({
          date
        })
        .withGraphFetched({
          task: {
            ...TasksRepo.DEFAULT_FETCH_GRAPH,
            $modify: ['filterTask']
          }
        })
        .modifiers({
          filterTask(builder) {
            builder.where(TaskModel.ref('author_uid'), uid)
          }
        }) as unknown) as Promise<Array<QueriedTask>>
    }, transformRejectReason)
  }

  removeBatch(taskIds: Array<TaskId>, trx: Transaction) {
    return this.scheduledTaskModel
      .query(trx)
      .delete()
      .whereIn('task_id', taskIds)
  }

  findWeekTasks(
    uid: UID,
    weekStart: string,
    weekEnd: string
  ): TE.TaskEither<UserError, Array<QueriedTask>> {
    return TE.tryCatch(() => {
      return (this.scheduledTaskModel
        .query()
        .where('date', '>=', weekStart)
        .where('date', '<=', weekEnd)
        .withGraphFetched({
          task: {
            ...TasksRepo.DEFAULT_FETCH_GRAPH,
            $modify: ['filterTasks']
          }
        })
        .modifiers({
          filterTasks(builder) {
            builder.where(TaskModel.ref('author_uid'), uid)
          }
        }) as unknown) as Promise<Array<QueriedTask>>
    }, transformRejectReason)
  }
}
