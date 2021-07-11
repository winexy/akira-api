import {f, Infer, number, pattern, required, string} from '@winexy/fuji'
import {Model} from 'objection'

type ScheduledTask = {
  id: number
  task_id: string
  date: string
}

export class ScheduledTaskModel extends Model implements ScheduledTask {
  id: number
  task_id: string
  date: string

  static tableName = 'scheduled_tasks'
}

export const scheduleTaskSchema = f.shape({
  task_id: f(string(), required()),
  date: f(string(), pattern(/\^d{4}-\d{2}-\d{2}$/), required())
})

export type ScheduleTaskDto = Infer<typeof scheduleTaskSchema>
