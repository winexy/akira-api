import {Model} from 'objection'

export interface SharedTask {
  id: number
  task_id: string
  user_id: string
  access: number
  created_at: string
  updated_at: string
}

export class SharedTaskModel extends Model implements SharedTask {
  static tableName = 'shared_tasks'

  id: number
  task_id: string
  user_id: string
  access: number
  created_at: string
  updated_at: string
}
