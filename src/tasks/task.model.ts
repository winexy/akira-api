import {Model} from 'objection'

type TaskT = {
  id: string
  author_uid: string
  title: string
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string
}

export class TaskModel extends Model implements TaskT {
  id: string
  author_uid: string
  title: string
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string

  static tableName = 'tasks'
}
