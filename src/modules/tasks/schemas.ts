import {fuji, required, shape, string} from '@winexy/fuji'

export const createTaskDtoSchema = fuji(
  shape({
    title: fuji(
      string('title should be string'),
      required('title is required')
    ),
    author_uid: fuji(
      string('author_uid should be string'),
      required('author_uid is required')
    )
  })
)
