import {Model} from 'objection'
import {TaskModel} from '../tasks/task.model'

type TodayEntity = {
  id: number
  task_id: string
}

export class TodayModel extends Model implements TodayEntity {
  id: number
  task_id: string

  static tableName = 'today_tasks'

  static get relationMapping() {
    return {
      task: {
        relation: Model.HasOneRelation,
        model: TaskModel,
        join: {
          from: 'task_id',
          to: 'id'
        }
      }
    }
  }
}
