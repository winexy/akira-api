import {fuji, required, shape, string} from '@winexy/fuji'

export const createTaskDtoSchema = fuji(
  shape({
    title: fuji(string(), required()),
    author_uid: fuji(string(), required())
  })
)
