import {Inject, Injectable} from '@nestjs/common'
import {isUndefined} from 'lodash'
import {TaskIdT, TaskModel} from '../tasks/task.model'
import {
  ScheduledTask,
  ScheduledTaskModel,
  ScheduleTaskDto
} from './scheduled-task.model'
import {Transaction} from 'objection'
import {TasksRepo, DefaultFetchedTaskGraph} from '../tasks/tasks.repository'
import {Either, left, right} from '@sweet-monads/either'
import {DBError} from 'db-errors'

type QueriedTask = ScheduledTask & {
  task: DefaultFetchedTaskGraph
}

@Injectable()
export class ScheduledTaskRepo {
  constructor(
    @Inject(ScheduledTaskModel)
    private readonly scheduledTaskModel: typeof ScheduledTaskModel
  ) {}

  async create(dto: ScheduleTaskDto) {
    const entity = await this.scheduledTaskModel
      .query()
      .findOne('task_id', dto.task_id)

    if (isUndefined(entity)) {
      return this.scheduledTaskModel.query().insert({
        task_id: dto.task_id,
        date: dto.date
      })
    }

    return this.scheduledTaskModel.query().patchAndFetchById(entity.id, {
      date: dto.date
    })
  }

  async delete(dto: ScheduleTaskDto) {
    return await this.scheduledTaskModel
      .query()
      .delete()
      .limit(1)
      .where('task_id', dto.task_id)
  }

  findByDate(date: string, trx: Transaction) {
    return this.scheduledTaskModel.query(trx).where({
      date
    })
  }

  async findUserTasksByDate(
    uid: UID,
    date: string
  ): Promise<Either<DBError, Array<QueriedTask>>> {
    try {
      const result = await this.scheduledTaskModel
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
        })
        .throwIfNotFound()

      return right((result as unknown) as Array<QueriedTask>)
    } catch (error) {
      return left(error)
    }
  }

  removeBatch(taskIds: Array<TaskIdT>, trx: Transaction) {
    return this.scheduledTaskModel
      .query(trx)
      .delete()
      .whereIn('task_id', taskIds)
  }

  async findWeekTasks(
    uid: UID,
    weekStart: string,
    weekEnd: string
  ): Promise<Either<DBError, Array<QueriedTask>>> {
    try {
      const result = await this.scheduledTaskModel
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
        })

      return right((result as unknown) as Array<QueriedTask>)
    } catch (error) {
      return left(error)
    }
  }
}
