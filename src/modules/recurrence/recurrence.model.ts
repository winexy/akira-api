import {
  defaultTo,
  f,
  Infer,
  max,
  min,
  number,
  positive,
  required,
  string,
  oneOf,
  fmap
} from '@winexy/fuji'
import {Model} from 'objection'
import RRule from 'rrule'
import {TaskModel, TaskT} from '../tasks/task.model'

export type Recurrence = {
  id: number
  rule: string
  next_date: string
  source_task_id: string
  author_uid: string
}

export class RecurrenceModel extends Model implements Recurrence {
  static tableName = 'recurrences'

  id: number
  rule: string
  next_date: string
  source_task_id: string
  author_uid: string

  static get relationMappings() {
    return {
      task: {
        relation: Model.HasOneRelation,
        modelClass: TaskModel,
        join: {
          from: 'recurrences.source_task_id',
          to: 'tasks.id'
        }
      }
    }
  }
}

export const ruleSchema = f.shape({
  frequency: f(number(), required(), min(0), max(3)),
  interval: f(number(), positive(), defaultTo(1)),
  weekDays: f.array(
    f(
      string(),
      oneOf(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']),
      fmap(day => RRule[day as 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'])
    )
  ),
  months: f.array(f(number(), min(1), max(12)))
})

export type RuleSchema = Infer<typeof ruleSchema>

export type RecurrenceWithTask = Recurrence & {task: TaskT}
