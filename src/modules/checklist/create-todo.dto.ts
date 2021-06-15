import {f, Infer, required, shape, string} from '@winexy/fuji'

export const createTodoDtoSchema = f(
  shape({
    taskId: f(string(), required()),
    title: f(string(), required())
  })
)

export type CreateTodoDto = Infer<typeof createTodoDtoSchema>
