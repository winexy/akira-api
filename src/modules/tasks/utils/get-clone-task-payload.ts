import {pick, merge} from 'fp-ts-std/ReadonlyRecord'
import {pipe} from 'fp-ts/lib/function'
import {format} from 'date-fns'
import {TaskT} from '../task.model'

const CLONEABLE_PROPERTIES = [
  'author_uid',
  'description',
  'is_important',
  'list_id',
  'recurrence_id',
  'title'
] as const

const extractPoperties = pick<TaskT>()(CLONEABLE_PROPERTIES)

export const getCloneTaskPayload = (task: TaskT) =>
  pipe(
    task,
    extractPoperties,
    merge({source_task_id: task.id, date: format(new Date(), 'yyyy-MM-dd')})
  )
