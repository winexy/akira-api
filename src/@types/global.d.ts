import {DBError} from 'db-errors'
import {NotFoundError} from 'objection'

declare global {
  type DBException = DBError | NotFoundError

  type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
  }
}
