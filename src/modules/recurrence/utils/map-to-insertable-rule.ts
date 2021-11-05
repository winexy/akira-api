import {endOfToday, formatISO} from 'date-fns'
import {RuleSchema} from '../recurrence.model'
import RRule, {WeekdayStr} from 'rrule'

export type InsertableRule = {
  rule: string
  next: string
}

export function mapToInsertableRule(dto: RuleSchema): InsertableRule {
  const weekDays = dto.weekDays as Array<WeekdayStr> | undefined

  const rrule = new RRule({
    freq: dto.frequency,
    interval: dto.interval,
    byweekday: weekDays?.map(day => RRule[day]),
    bymonth: dto.months
  })

  return {
    rule: rrule.toString(),
    next: formatISO(rrule.after(endOfToday()))
  }
}
