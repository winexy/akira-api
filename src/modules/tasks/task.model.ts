import {fuji, shape, string} from '@winexy/fuji'
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
    // TODO update FUJI
    // title: fuji(string('titlte should be type of string')),
    description: fuji(string('description should be type of string'))
    // is_completed: fuji(bool('is_completed should be type of boolean')),
    // is_important: fuji(bool('is_important should be type of boolean'))
  })
)
