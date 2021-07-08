import {f, string, required, maxLength, Infer} from '@winexy/fuji'
import {Model} from 'objection'
import {TaskModel} from '../tasks/task.model'

export type TaskList = {
  id: number
  title: string
  author_uid: string
}

export class ListModel extends Model implements TaskList {
  id: number
  title: string
  author_uid: string

  static tableName = 'task_lists'

  static get relationMappings() {
    return {
      tasks: {
        relation: Model.HasManyRelation,
        join: {
          from: 'task_lists.id',
          to: 'tasks.list_id'
        },
        modelClass: TaskModel
      }
    }
  }
}

export const createTaskListSchema = f.shape({
  title: f(string(), required(), maxLength(255))
})

export type CreateTaskListDto = Infer<typeof createTaskListSchema>
