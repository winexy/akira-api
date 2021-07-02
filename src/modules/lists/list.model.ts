import {f, string, required, maxLength, Infer} from '@winexy/fuji'
import {Model} from 'objection'

export type TaskList = {
  id: number
  title: string
  author_uid: string
}

export class ListModel extends Model implements TaskList {
  id: number
  title: string
  author_uid: string

  static tableName = 'task_lists'
}

export const createTaskListSchema = f.shape({
  title: f(string(), required(), maxLength(255))
})

export type CreateTaskListDto = Infer<typeof createTaskListSchema>
