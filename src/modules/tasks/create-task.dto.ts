import {f, Infer, required, string} from '@winexy/fuji'

export const createTaskDtoSchema = f.shape({
  title: f(string(), required()),
  author_uid: f(string(), required())
})

export type CreateTaskDto = Infer<typeof createTaskDtoSchema>
