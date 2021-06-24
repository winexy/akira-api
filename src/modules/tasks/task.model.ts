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
import {ChecklistModel} from '../checklist/checklist.model'
import {TagModel} from '../tags/tag.model'

export type TaskT = {
  id: string
  author_uid: string
  title: string
  description: string
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string
  list_id: number | null
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
  list_id: number | null

  static tableName = 'tasks'

  static get relationMappings() {
    return {
      checklist: {
        relation: Model.HasManyRelation,
        modelClass: ChecklistModel,
        join: {
          from: 'tasks.id',
          to: 'checklist.task_id'
        }
      },
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: TagModel,
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_tags.task_id',
            to: 'tasks_tags.tag_id'
          },
          to: 'tags.id'
        }
      }
    }
  }
}

const titleSchema = f(string(), required(), maxLength(255))

export const createTaskDtoSchema = f.shape({
  title: titleSchema,
  author_uid: f(string(), required())
})

export type CreateTaskDto = Infer<typeof createTaskDtoSchema>

export const taskPatchSchema = f.shape({
  title: excludeRules(titleSchema, ['required']),
  description: f(
    string(),
    fmap(s => s?.trim())
  ),
  is_completed: f(bool()),
  is_important: f(bool())
})

export type TaskPatchT = Infer<typeof taskPatchSchema>

const toBoolOrUndef = fmap((x: string) => {
  return isUndefined(x) ? undefined : x === '1'
})

const numericBoolSchema = f(string(), oneOf(['1', '0']), toBoolOrUndef)

export const tasksQueryFiltersSchema = f.shape({
  is_completed: numericBoolSchema,
  is_important: numericBoolSchema,
  is_today: numericBoolSchema
})

export type TasksQueryFiltersT = Infer<typeof tasksQueryFiltersSchema>
