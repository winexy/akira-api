import {Model} from 'objection'

type TaskListT = {
  id: number
  title: string
}

export class TaskListModel extends Model implements TaskListT {
  id: number
  title: string

  static tableName = 'task-lists'
}
