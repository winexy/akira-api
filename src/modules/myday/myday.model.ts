import {Model} from 'objection'
import {TaskModel} from '../tasks/task.model'

export type MyDay = {
  task_id: string
}

export class MyDayModel extends Model implements MyDay {
  task_id: string

  static tableName = 'myday'

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
