import {f, Infer, number, positive, required, string} from '@winexy/fuji'
import {Model} from 'objection'

export interface SharedTask {
  id: number
  task_id: string
  user_id: string
  access: number
  created_at: string
  updated_at: string
}

export class SharedTaskModel extends Model implements SharedTask {
  static tableName = 'shared_tasks'

  id: number
  task_id: string
  user_id: string
  access: number
  created_at: string
  updated_at: string
}

export const patchSharedTaskSchema = f.shapeRequired({
  access: f(number(), positive())
})

export type SharedTaskPatchDto = Infer<typeof patchSharedTaskSchema>

export const createSharedTaskSchema = f.shapeRequired({
  task_id: f(string(), required()),
  user_id: f(string(), required()),
  access: f(number(), positive())
})

export type CreateSharedTaskDto = Infer<typeof createSharedTaskSchema>
