import {Model} from 'objection'

export type ChecklistT = {
  id: number
  title: string
  task_id: string
  is_completed: boolean
}

export class ChecklistModel extends Model implements ChecklistT {
  static tableName = 'checklist'

  id: number
  title: string
  task_id: string
  is_completed: boolean
}
