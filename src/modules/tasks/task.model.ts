import {
  bool,
  f,
  Infer,
  maxLength,
  required,
  string,
  excludeRules
} from '@winexy/fuji'
import {Model} from 'objection'

export type TaskT = {
  id: string
  author_uid: string
  title: string
  description: string
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string
}

export type TaskIdT = TaskT['id']
export class TaskModel extends Model implements TaskT {
  id: string
  author_uid: string
  title: string
  description: string
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string

  static tableName = 'tasks'
}

const titleSchema = f(string(), required(), maxLength(255))

export const createTaskDtoSchema = f.shape({
  title: titleSchema,
  author_uid: f(string(), required())
})

export type CreateTaskDto = Infer<typeof createTaskDtoSchema>

export const taskPatchSchema = f.shape({
  title: excludeRules(titleSchema, ['required']),
  description: f(string()),
  is_completed: f(bool()),
  is_important: f(bool())
})

export type TaskPatchT = Infer<typeof taskPatchSchema>
