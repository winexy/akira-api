import {
  f,
  required,
  string,
  maxLength,
  pattern,
  fmap,
  Infer,
  minLength
} from '@winexy/fuji'
import {Model} from 'objection'

export type Tag = {
  id: number
  uid: string
  name: string
  hex_bg: string
  hex_color: string
}

export class TagModel extends Model implements Tag {
  id: number
  uid: string
  name: string
  hex_bg: string
  hex_color: string

  static tableName = 'tags'
}

const hexSchema = f(
  required(),
  pattern(/^#[a-z0-9]{3,6}$/),
  minLength(4),
  maxLength(7),
  fmap(s => s.toLowerCase())
)

export const createTagSchema = f.shape({
  name: f(string(), required(), maxLength(60)),
  hex_bg: hexSchema,
  hex_color: hexSchema
})

export type CreateTagDto = Infer<typeof createTagSchema>
