import {Model} from 'objection'

export type Note = {
  uuid: string
  title: string
  content: string
  author_uid: string
}

export class NoteModel extends Model implements Note {
  uuid: string
  title: string
  content: string
  author_uid: string

  static idColumn = 'uuid'
  static tableName = 'notes'
}
