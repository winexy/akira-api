import {Either} from '@sweet-monads/either'
import {DBError} from 'db-errors'
import {NotFoundError} from 'objection'

declare global {
  type EitherP<L, R> = Promise<Either<L, R>>
  type DBException = DBError | NotFoundError
}
