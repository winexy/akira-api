import {bool, fuji, shape, string} from '@winexy/fuji'
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

type NonPatchableProps = 'id' | 'author_uid' | 'created_at' | 'updated_at'
export type TaskPatchT = Partial<Omit<TaskT, NonPatchableProps>>

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

export const taskPatchSchema = fuji(
  shape({
    title: fuji(string()),
    description: fuji(string()),
    is_completed: fuji(bool()),
    is_important: fuji(bool())
  })
)
