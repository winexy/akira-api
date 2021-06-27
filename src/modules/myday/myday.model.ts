import {Model} from 'objection'
import {TaskModel} from '../tasks/task.model'

export type MyDay = {
  task_id: string
  author_uid: string
}

export class MyDayModel extends Model implements MyDay {
  task_id: string
  author_uid: string

  static tableName = 'myday'
  static idColumn = 'task_id'

  static get relationMappings() {
    return {
      task: {
        relation: Model.HasOneRelation,
        modelClass: TaskModel,
        join: {
          from: ['myday.task_id', 'myday.author_uid'],
          to: ['tasks.id', 'tasks.author_uid']
        }
      }
    }
  }
}
