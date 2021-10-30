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
import {ScheduledTaskModel} from '../task-scheduler/scheduled-task.model'
import {RecurrenceModel} from '../recurrence/recurrence.model'

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
      schedule: {
        relation: Model.HasOneRelation,
        modelClass: ScheduledTaskModel,
        join: {
          from: 'tasks.id',
          to: 'scheduled_tasks.task_id'
        }
      },
      recurrence: {
        relation: Model.HasOneRelation,
        modelClass: RecurrenceModel,
        join: {
          from: 'tasks.recurrence_id',
          to: 'recurrences.id'
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
    )
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
