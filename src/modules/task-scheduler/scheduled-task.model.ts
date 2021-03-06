import {f, Infer, nullable, pattern, required, string} from '@winexy/fuji'
import {Model} from 'objection'
import {TaskModel} from '../tasks/task.model'

export type ScheduledTask = {
  id: number
  task_id: string
  date: string | null
}

export class ScheduledTaskModel extends Model implements ScheduledTask {
  id: number
  task_id: string
  date: string | null

  static tableName = 'scheduled_tasks'

  static get relationMappings() {
    return {
      task: {
        relation: Model.HasOneRelation,
        modelClass: TaskModel,
        join: {
          from: 'scheduled_tasks.task_id',
          to: 'tasks.id'
        }
      }
    }
  }
}

export const scheduleTaskSchema = f.shape({
  task_id: f(string(), required()),
  date: f(string(), pattern(/^\d{4}-\d{2}-\d{2}$/), required(), nullable())
})

export type ScheduleTaskDto = Infer<typeof scheduleTaskSchema>
