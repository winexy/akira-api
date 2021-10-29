import {Injectable, Logger} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'
import {RecurrenceService} from './recurrence.service'
import {TasksService} from '../tasks/tasks.service'
import * as E from 'fp-ts/lib/Either'

@Injectable()
export class RecurrenceWorker {
  private readonly logger = new Logger(RecurrenceWorker.name)

  constructor(
    private readonly recurrenceService: RecurrenceService,
    private readonly tasksService: TasksService
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'recurrence',
    timeZone: 'Europe/Moscow'
  })
  async worker() {
    this.logger.log('recurrence worker')
    /**
     * todo
     * find tasks
     * clone them
     *
     */

    const task = this.recurrenceService.findRecurrenceTasksForToday()

    const result = await task()

    console.log(E.isRight(result) && result.right)
  }
}
