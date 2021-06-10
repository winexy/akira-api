import {bool, fuji, shape, string} from '@winexy/fuji'
import {Model} from 'objection'

export type TodoT = {
  id: number
  title: string
  task_id: string
  is_completed: boolean
}

export type TodoIdT = TodoT['id']

type NonPatchableProps = 'id' | 'task_id'
export type TodoPatchT = Partial<Omit<TodoT, NonPatchableProps>>
export class ChecklistModel extends Model implements TodoT {
  static tableName = 'checklist'

  id: number
  title: string
  task_id: string
  is_completed: boolean
}

export const todoPatchSchema = fuji(
  shape({
    // title: fuji(string('title should be type of string')),
    is_completed: fuji(bool('is_completed should be type of bool'))
  })
)
