import {Model} from 'objection'

type Recurrence = {
  id: number
  rule: string
  next_date: string
  source_task_id: string
}

export class RecurrenceModel extends Model implements Recurrence {
  static tableName = 'recurrences'

  id: number
  rule: string
  next_date: string
  source_task_id: string
}
