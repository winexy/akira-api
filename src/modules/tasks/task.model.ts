import {
  bool,
  f,
  fmap,
  Infer,
  maxLength,
  required,
  string,
  excludeRules,
  oneOf,
  number,
  pattern,
  nullable
} from '@winexy/fuji'
import {formatISO} from 'date-fns'
import {isUndefined} from 'lodash'
import {Model, ModelOptions, QueryContext} from 'objection'
import {ChecklistModel} from '../checklist/checklist.model'
import {ListModel} from '../lists/list.model'
import {TagModel} from '../tags/tag.model'
import {RecurrenceModel} from '../recurrence/recurrence.model'
import {UserModel} from '../users/users.model'
import {SharedTaskModel} from '../share-task/shared-task.model'

export type TaskT = {
  id: string
  author_uid: string
  title: string
  description: string
  date: string | null
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string
  list_id: number | null
  due_date: string | null
  recurrence_id: number | null
  source_task_id: string | null
}

export type TaskId = TaskT['id']
export class TaskModel extends Model implements TaskT {
  id: string
  author_uid: string
  title: string
  description: string
  date: string | null
  is_completed: boolean
  is_important: boolean
  created_at: string
  updated_at: string
  list_id: number | null
  due_date: string | null
  recurrence_id: number | null
  source_task_id: string | null

  static tableName = 'tasks'

  async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext)

    if (opt.patch) {
      this.updated_at = formatISO(new Date())
    }
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.HasOneRelation,
        modelClass: UserModel,
        join: {
          from: 'tasks.author_uid',
          to: 'users.uid'
        }
      },
      checklist: {
        relation: Model.HasManyRelation,
        modelClass: ChecklistModel,
        join: {
          from: 'tasks.id',
          to: 'checklist.task_id'
        }
      },
      list: {
        relation: Model.HasOneRelation,
        modelClass: ListModel,
        join: {
          from: 'tasks.list_id',
          to: 'task_lists.id'
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
      },
      recurrence: {
        relation: Model.HasOneRelation,
        modelClass: RecurrenceModel,
        join: {
          from: 'tasks.recurrence_id',
          to: 'recurrences.id'
        }
      },
      shared: {
        relation: Model.HasOneRelation,
        modelClass: SharedTaskModel,
        join: {
          from: 'tasks.id',
          to: 'shared_tasks.task_id'
        }
      }
    }
  }
}

const titleSchema = f(string(), required(), maxLength(255))
const datePattern = pattern(/\d{4}-\d{2}-\d{2}/)

export const createTaskDtoSchema = f.shape({
  task: f.shapeRequired({
    title: titleSchema,
    description: f(
      string(),
      fmap(s => s?.trim())
    ),
    due_date: f(nullable(), datePattern)
  }),
  meta: f.shapeRequired({
    date: f(required(), nullable(), datePattern),
    tags: f.array(f(number())),
    list_id: f(number())
  })
})

export type CreateTaskDto = Infer<typeof createTaskDtoSchema>

export const taskPatchSchema = f.shape({
  title: excludeRules(titleSchema, ['required']),
  description: f(
    string(),
    fmap(s => s?.trim())
  ),
  is_completed: f(bool()),
  is_important: f(bool()),
  list_id: f(number()),
  date: f(nullable(), datePattern),
  due_date: f(nullable(), datePattern)
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

export type InsertNewTaskDto = {
  title: string
  description?: string
  author_uid: string
  list_id?: number
  date?: string | null
  due_date?: string | null
}

export type InsertClonedTaskDto = Pick<
  TaskT,
  | 'title'
  | 'description'
  | 'author_uid'
  | 'list_id'
  | 'is_important'
  | 'recurrence_id'
> & {
  source_task_id: string
}
