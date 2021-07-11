import {Inject, Injectable} from '@nestjs/common'
import {isUndefined} from 'lodash'
import {TaskIdT} from '../tasks/task.model'
import {ScheduledTaskModel, ScheduleTaskDto} from './scheduled-task.model'
import {Transaction} from 'objection'

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
}
