import {fuji, shape, required, string} from '@winexy/fuji'
import {TaskIdT} from '../tasks/task.model'

export type CreateTodoDto = {
  taskId: TaskIdT
  title: string
}

export const createTodoDtoSchema = fuji(
  shape({
    taskId: fuji(required(), string()),
    title: fuji(required(), string())
  })
)
