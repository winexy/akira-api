import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {TaskIdT} from '../tasks/task.model'
import {TodayModel} from './today.model'

@Injectable()
export class TodayRepo {
  constructor(
    @Inject(TodayModel) private readonly todayModel: typeof TodayModel
  ) {}

  async create(taskId: TaskIdT) {
    try {
      const result = await this.todayModel.query().insert({task_id: taskId})

      return right(result)
    } catch (error) {
      return left(error)
    }
  }

  async remove(taskId: TaskIdT) {
    try {
      const result = await this.todayModel
        .query()
        .deleteById(taskId)
        .throwIfNotFound()

      return right(result)
    } catch (error) {
      return left(error)
    }
  }
}
