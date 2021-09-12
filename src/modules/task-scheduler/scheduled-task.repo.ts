import {Inject, Injectable} from '@nestjs/common'
import {isUndefined} from 'lodash'
import {TaskIdT, TaskModel} from '../tasks/task.model'
import {ScheduledTaskModel, ScheduleTaskDto} from './scheduled-task.model'
import {Transaction} from 'objection'
import {TasksRepo} from '../tasks/tasks.repository'

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

  findByDate(date: string, trx: Transaction) {
    return this.scheduledTaskModel.query(trx).where({
      date
    })
  }

  removeBatch(taskIds: Array<TaskIdT>, trx: Transaction) {
    return this.scheduledTaskModel
      .query(trx)
      .delete()
      .whereIn('task_id', taskIds)
  }

  findWeekTasks(uid: UID, weekStart: string, weekEnd: string) {
    return this.scheduledTaskModel
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
  }
}
