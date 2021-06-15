import {bool, f, Infer, string} from '@winexy/fuji'
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

export const todoPatchSchema = f.shape({
  title: f(string()),
  is_completed: f(bool())
})

export type TodoPatchT = Infer<typeof todoPatchSchema>
