import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {map} from 'lodash'
import {TaskIdT, TaskT} from '../tasks/task.model'
import {MyDayModel, MyDay} from './myday.model'

@Injectable()
export class MyDayRepo {
  constructor(
    @Inject(MyDayModel) private readonly myDayModel: typeof MyDayModel
  ) {}

  async create(uid: UID, taskId: TaskIdT) {
    try {
      const result = await this.myDayModel
        .query()
        .insert({author_uid: uid, task_id: taskId})

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

  async findTodayTasksByUID(uid: UID): EitherP<DBException, TaskT[]> {
    try {
      const result = await this.myDayModel
        .query()
        .where({author_uid: uid})
        .withGraphFetched({
          task: {
            checklist: true,
            tags: true
          }
        })

      return right(map(result, 'task'))
    } catch (error) {
      return left(error)
    }
  }
}
