import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'
import {TaskT} from '../tasks/task.model'
import {TasksService} from '../tasks/tasks.service'

@Injectable()
export class ReportsService {
  constructor(private readonly taskService: TasksService) {}

  FindFor(
    uid: UID,
    date: string
  ): TE.TaskEither<UserError, {date: string; tasks: Array<TaskT>}> {
    return pipe(
      this.taskService.FindByDate()(uid, date),
      TE.map(tasks => ({date, tasks}))
    )
  }
}
