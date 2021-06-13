import {fuji, required, shape, string} from '@winexy/fuji'
export interface CreateTaskDto {
  title: string
  author_uid: string
}

export const createTaskDtoSchema = fuji(
  shape({
    title: fuji(string(), required()),
    author_uid: fuji(string(), required())
  })
)
