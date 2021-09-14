import {Injectable} from '@nestjs/common'
import {DBError} from 'db-errors'
import {TaskSchedulerService} from '../task-scheduler/task-scheduler.service'
import {DefaultFetchedTaskGraph} from '../tasks/tasks.repository'

@Injectable()
export class ReportsService {
  constructor(private readonly taskSchedulerService: TaskSchedulerService) {}

  async findFor(
    uid: UID,
    date: string
  ): EitherP<DBError, {date: string; tasks: Array<DefaultFetchedTaskGraph>}> {
    const result = await this.taskSchedulerService.findByDate(uid, date)

    return result.map(tasks => ({date, tasks}))
  }
}
