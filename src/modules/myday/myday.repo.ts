import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {TaskIdT} from '../tasks/task.model'
import {MyDayModel} from './myday.model'

@Injectable()
export class MyDayRepo {
  constructor(
    @Inject(MyDayModel) private readonly myDayModel: typeof MyDayModel
  ) {}

  async create(taskId: TaskIdT) {
    try {
      const result = await this.myDayModel.query().insert({task_id: taskId})

      return right(result)
    } catch (error) {
      return left(error)
    }
  }

  async remove(taskId: TaskIdT) {
    try {
      const result = await this.myDayModel
        .query()
        .deleteById(taskId)
        .throwIfNotFound()

      return right(result)
    } catch (error) {
      return left(error)
    }
  }

  findTodayTasksByUID(uid: UID) {
    return this.myDayModel.relatedQuery('task').where({uid})
  }
}
