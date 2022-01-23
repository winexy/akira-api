import {Model} from 'objection'

export type Note = {
  uuid: string
  content: string
  author_uid: string
}

export class NoteModel extends Model implements Note {
  uuid: string
  content: string
  author_uid: string

  static tableName = 'notes'
}
