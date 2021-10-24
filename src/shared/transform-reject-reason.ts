import {keys} from 'lodash'

export type RejectedQueryError = DBException

export const transformRejectReason = (reason: unknown) => {
  console.log(reason, keys(reason))
  return reason as RejectedQueryError
}
