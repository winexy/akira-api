import {DBError} from 'db-errors'
import {NotFoundError} from 'objection'
import {UserError} from 'src/filters/user-error.exception.filter'

export type RejectedQueryError = DBException

export const transformRejectReason = (reason: unknown): UserError => {
  if (reason instanceof NotFoundError) {
    return UserError.of({
      type: UserError.NotFound,
      message: 'not found',
      meta: {reason}
    })
  }

  if (reason instanceof DBError) {
    return UserError.of({
      type: UserError.DbQuery,
      message: reason.message,
      meta: {reason}
    })
  }

  return UserError.of({
    type: UserError.UnknownDbQuery,
    message: 'DB Query Failed for unknown reason',
    meta: {reason}
  })
}
