import {
  bool,
  f,
  fmap,
  Infer,
  maxLength,
  required,
  string,
  excludeRules,
  oneOf
} from '@winexy/fuji'
import {isUndefined} from 'lodash'
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

const toBoolOrUndef = fmap((x: string) => {
  return isUndefined(x) ? undefined : x === '1'
})

const isNumericBool = oneOf(['1', '0'])

export const tasksQueryFiltersSchema = f.shape({
  is_completed: f(string(), isNumericBool, toBoolOrUndef),
  is_important: f(string(), isNumericBool, toBoolOrUndef)
})

export type TasksQueryFiltersT = Infer<typeof tasksQueryFiltersSchema>
