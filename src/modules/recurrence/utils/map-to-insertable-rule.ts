import {isValid, parseISO} from 'date-fns'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/Array'
import {pipe} from 'fp-ts/lib/function'
import {RuleSchema} from '../recurrence.model'
import RRule, {WeekdayStr} from 'rrule'
import {UserError} from '../../../filters/user-error.exception.filter'

export type InsertableRule = {
  rule: string
  next: string
}

export function mapToInsertableRule(
  dto: RuleSchema
): E.Either<UserError, InsertableRule> {
  return pipe(
    parseISO(dto.startDate ?? ''),
    E.fromPredicate(isValid, () =>
      UserError.of({
        type: UserError.BadRequest,
        message: 'Invalid Start Date'
      })
    ),
    E.map(startDate => {
      return new RRule({
        dtstart: startDate,
        freq: dto.frequency,
        interval: dto.interval,
        byweekday: dto.weekDays as Array<WeekdayStr> | undefined,
        bymonth: dto.months,
        count: 1
      })
    }),
    E.map(rrule => {
      return pipe(
        A.head(rrule.all()),
        O.map(date => ({
          rule: rrule.toString(),
          next: date.toISOString()
        }))
      )
    }),
    E.chain(
      E.fromOption(() => {
        return UserError.of({
          type: UserError.Internal,
          message: 'Invalid Next Date'
        })
      })
    )
  )
}
