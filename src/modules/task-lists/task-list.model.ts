import {f, string, required, maxLength, Infer} from '@winexy/fuji'
import {Model} from 'objection'

type TaskListT = {
  id: number
  title: string
}

export class TaskListModel extends Model implements TaskListT {
  id: number
  title: string
  author_uid: string

  static tableName = 'task-lists'
}

export const createTaskListSchema = f.shape({
  title: f(string(), required(), maxLength(255))
})

export type CreateTaskListDto = Infer<typeof createTaskListSchema>
