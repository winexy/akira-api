import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'
import {transformRejectReason} from 'src/shared/transform-reject-reason'

export function taskEitherQuery<T>(
  query: () => Promise<T>
): TE.TaskEither<UserError, T> {
  return TE.tryCatch(query, transformRejectReason)
}
