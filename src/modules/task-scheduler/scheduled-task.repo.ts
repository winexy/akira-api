import {Inject, Injectable} from '@nestjs/common'
import {ScheduledTaskModel, ScheduleTaskDto} from './scheduled-task.model'

@Injectable()
export class ScheduledTaskRepo {
  constructor(
    @Inject(ScheduledTaskModel)
    private readonly scheduledTaskModel: typeof ScheduledTaskModel
  ) {}

  create(dto: ScheduleTaskDto) {
    return this.scheduledTaskModel.query().insert({
      task_id: dto.task_id,
      date: dto.date
    })
  }
}
