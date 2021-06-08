import {Model} from 'objection'

export type TodoT = {
  id: number
  title: string
  task_id: string
  is_completed: boolean
}

export type TodoIdT = TodoT['id']

export class ChecklistModel extends Model implements TodoT {
  static tableName = 'checklist'

  id: number
  title: string
  task_id: string
  is_completed: boolean
}
