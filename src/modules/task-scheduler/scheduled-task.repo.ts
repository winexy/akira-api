import {Inject, Injectable} from '@nestjs/common'
import {isUndefined} from 'lodash'
import {ScheduledTaskModel, ScheduleTaskDto} from './scheduled-task.model'

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
    })
  }
}
