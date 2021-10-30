import {endOfWeek, format, startOfWeek} from 'date-fns'

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'

export function getWeekRange(date: Date) {
  const weekConfig = {weekStartsOn: 1} as const

  return [
    format(startOfWeek(date, weekConfig), DEFAULT_DATE_FORMAT),
    format(endOfWeek(date, weekConfig), DEFAULT_DATE_FORMAT)
  ]
}
