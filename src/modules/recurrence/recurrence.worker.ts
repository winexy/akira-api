import {Injectable} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'
import * as TE from 'fp-ts/lib/TaskEither'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import {flow, pipe} from 'fp-ts/lib/function'
import {tap} from 'fp-ts-std/IO'
import {endOfToday, formatISO} from 'date-fns'
import RRule from 'rrule'
import {RecurrenceService} from './recurrence.service'
import {TasksService} from '../tasks/tasks.service'
import {IOLogger} from 'src/shared/io-logger'
import {startTransaction} from 'src/shared/transaction'
import {WorkerSpec} from 'src/shared/app-worker'

@Injectable()
export class RecurrenceWorker implements WorkerSpec {
  private readonly logger = IOLogger.of(RecurrenceWorker.name)

  constructor(
    private readonly recurrenceService: RecurrenceService,
    private readonly tasksService: TasksService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'recurrence',
    timeZone: 'Europe/Moscow'
  })
  async Worker() {
    await this.RunTask()
  }

  async RunTask() {
    const {trx, foldTransaction} = await startTransaction()

    const runTask = pipe(
      this.logger.log(`Starting Recurrence Worker. Date=${String(new Date())}`),
      TE.fromIO,
      TE.chain(() => this.recurrenceService.FindRecurrentForToday(trx)),
      TE.chainFirstIOK(
        tap(recurrences =>
          this.logger.log(`Found ${RA.size(recurrences)} recurrent tasks`)
        )
      ),
      TE.chainFirst(
        flow(
          TE.traverseArray(this.tasksService.InternalCloneTask(trx)),
          TE.chainFirstIOK(
            tap(tasks => this.logger.log(`Cloned ${RA.size(tasks)} tasks`))
          )
        )
      ),
      TE.map(
        RA.map(recurrence => ({
          id: recurrence.id,
          nextDate: formatISO(
            RRule.fromString(recurrence.rule).after(endOfToday())
          )
        }))
      ),
      TE.chainFirst(
        TE.traverseArray(this.recurrenceService.UpdateNextDate(trx))
      ),
      TE.chainFirstIOK(
        tap(recurrences =>
          this.logger.log(`Updated ${RA.size(recurrences)} recurrences`)
        )
      ),
      foldTransaction(
        error => {
          return this.logger.error(
            'Recurrence worker finished with error',
            error.toJSON()
          )
        },
        () => {
          return this.logger.log('Recurrence worker finished with success')
        }
      )
    )

    await runTask()
  }
}
