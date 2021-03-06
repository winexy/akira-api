import {
  bool,
  excludeRules,
  f,
  Infer,
  maxLength,
  required,
  string
} from '@winexy/fuji'
import {Model, QueryBuilder} from 'objection'

export type TodoT = {
  id: number
  title: string
  task_id: string
  is_completed: boolean
  createad_at: string
  updated_at: string
}

export type TodoIdT = TodoT['id']
export class ChecklistModel extends Model implements TodoT {
  static tableName = 'checklist'

  id: number
  title: string
  task_id: string
  is_completed: boolean
  createad_at: string
  updated_at: string

  static get modifiers() {
    return {
      ordered(builder: QueryBuilder<ChecklistModel>) {
        builder.orderBy('created_at')
      }
    }
  }
}

const titleSchema = f(string(), maxLength(255), required())

export const createTodoDtoSchema = f.shape({
  taskId: f(string(), required()),
  title: titleSchema
})

export type CreateTodoDto = Infer<typeof createTodoDtoSchema>

export const todoPatchSchema = f.shape({
  title: excludeRules(titleSchema, ['required']),
  is_completed: f(bool())
})

export type TodoPatchT = Infer<typeof todoPatchSchema>
