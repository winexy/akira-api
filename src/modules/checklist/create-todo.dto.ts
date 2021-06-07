import {fuji, shape, required, string} from '@winexy/fuji'
import {TaskIdT} from '../tasks/task.model'

export type CreateTodoDto = {
  taskId: TaskIdT
  title: string
}

export const createTodoDtoSchema = fuji(
  shape({
    taskId: fuji(
      required('taskId is required'),
      string('taskId should be type of string')
    ),
    title: fuji(
      required('title is required'),
      string('title should be type of string')
    )
  })
)
