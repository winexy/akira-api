import {endOfToday, formatISO} from 'date-fns'
import {pipe} from 'fp-ts/lib/function'
import {RuleSchema} from '../recurrence.model'
import RRule, {WeekdayStr} from 'rrule'
import * as IO from 'fp-ts/lib/IO'
import * as D from 'fp-ts/lib/Date'

export type InsertableRule = {
  rule: string
  next: string
}

export function mapToInsertableRule(dto: RuleSchema): IO.IO<InsertableRule> {
  return pipe(
    D.create,
    IO.map(startDate => {
      const weekDays = dto.weekDays as Array<WeekdayStr> | undefined

      return new RRule({
        dtstart: startDate,
        freq: dto.frequency,
        interval: dto.interval,
        byweekday: weekDays?.map(day => RRule[day]),
        bymonth: dto.months
      })
    }),
    IO.map(rrule => ({
      rule: rrule.toString(),
      next: formatISO(rrule.after(endOfToday()))
    }))
  )
}
