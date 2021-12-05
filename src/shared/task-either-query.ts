import * as TE from 'fp-ts/lib/TaskEither'
import {Model, QueryBuilder} from 'objection'
import {UserError} from 'src/filters/user-error.exception.filter'
import {transformRejectReason} from 'src/shared/transform-reject-reason'

export function taskEitherQuery<T>(
  query: () => QueryBuilder<Model, T> | Promise<T>
): TE.TaskEither<UserError, T> {
  return TE.tryCatch(
    (query as unknown) as () => Promise<T>,
    transformRejectReason
  )
}
