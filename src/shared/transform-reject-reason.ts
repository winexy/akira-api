import {DBError} from 'db-errors'
import {NotFoundError} from 'objection'
import {UserError, UserErrorEnum} from 'src/filters/user-error.exception.filter'

export type RejectedQueryError = DBException

export const transformRejectReason = (reason: unknown): UserError => {
  if (reason instanceof UserError) {
    return reason
  }

  if (reason instanceof NotFoundError) {
    return UserError.of({
      type: UserErrorEnum.NotFound,
      message: 'not found',
      meta: {reason}
    })
  }

  if (reason instanceof DBError) {
    return UserError.of({
      type: UserErrorEnum.DbQuery,
      message: reason.message,
      meta: {reason}
    })
  }

  return UserError.of({
    type: UserErrorEnum.UnknownDbQuery,
    message: 'DB Query Failed for unknown reason',
    meta: {reason}
  })
}
