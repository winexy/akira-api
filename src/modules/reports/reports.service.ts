import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import {TaskSchedulerService} from '../task-scheduler/task-scheduler.service'
import {DefaultFetchedTaskGraph} from '../tasks/tasks.repository'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'

@Injectable()
export class ReportsService {
  constructor(private readonly taskSchedulerService: TaskSchedulerService) {}

  FindFor(
    uid: UID,
    date: string
  ): TE.TaskEither<
    UserError,
    {date: string; tasks: Array<DefaultFetchedTaskGraph>}
  > {
    return pipe(
      this.taskSchedulerService.findByDate(uid, date),
      TE.map(tasks => ({date, tasks}))
    )
  }
}
