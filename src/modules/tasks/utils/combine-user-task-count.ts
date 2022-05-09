import {curry2} from 'fp-ts-std/Function'
import {pipe} from 'fp-ts/lib/function'
import {UserTaskCountMeta} from '../tasks.repository'
import * as A from 'fp-ts/lib/Array'
import * as R from 'fp-ts/lib/Record'
import {concat} from 'src/shared/array-utils'

type UserId = string
type Count = number
export type TaskCountByUserId = Record<UserId, Count>

export const combineUserTaskCount = curry2(
  (
    meta1: Array<UserTaskCountMeta>,
    meta2: Array<UserTaskCountMeta>
  ): TaskCountByUserId => {
    return pipe(
      meta1,
      concat<UserTaskCountMeta>()(meta2),
      A.reduce({}, (dict: TaskCountByUserId, meta) => {
        if (R.has(meta.user_id, dict)) {
          dict[meta.user_id] += parseInt(meta.tasks_count, 10)
        } else {
          dict[meta.user_id] = parseInt(meta.tasks_count)
        }

        return dict
      })
    )
  }
)
