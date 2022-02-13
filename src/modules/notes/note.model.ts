import {f, Infer, string} from '@winexy/fuji'
import formatISO from 'date-fns/formatISO'
import {Model, ModelOptions, QueryContext} from 'objection'

export type Note = {
  uuid: string
  title: string
  content: string
  author_uid: string
  created_at: string
  updated_at: string
}

export class NoteModel extends Model implements Note {
  uuid: string
  title: string
  content: string
  author_uid: string
  created_at: string
  updated_at: string

  static idColumn = 'uuid'
  static tableName = 'notes'

  async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext)

    if (opt.patch) {
      this.updated_at = formatISO(new Date())
    }
  }
}

export const notePatchSchema = f.shape({
  title: f(string()),
  content: f(string())
})

export type NotePatch = Infer<typeof notePatchSchema>
