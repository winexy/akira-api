import {Injectable} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'
import {TasksService} from './tasks.service'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import {formatISO} from 'date-fns'
import {tap} from 'fp-ts-std/IO'
import {IOLogger} from 'src/shared/io-logger'
import {startTransaction} from 'src/shared/transaction'

@Injectable()
export class DueDateWorker {
  private readonly logger = IOLogger.of(DueDateWorker.name)

  constructor(private readonly tasksService: TasksService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'DueDateWorker',
    timeZone: process.env.TZ
  })
  async Worker() {
    await this.RunTask()
  }

  async RunTask() {
    const {trx, foldTransaction} = await startTransaction()

    const runTask = pipe(
      this.tasksService.FindRescheduableTasksWithDueDate(trx),
      TE.chainFirstIOK(
        tap(tasks =>
          this.logger.log(`Found ${RA.size(tasks)} rescheduable tasks`)
        )
      ),
      TE.map(
        RA.map(task => ({
          taskId: task.id,
          date: formatISO(new Date())
        }))
      ),
      TE.map(
        TE.traverseArray(task => {
          return this.tasksService.InternalPatchTask(trx)(task.taskId, {
            date: task.date
          })
        })
      ),
      foldTransaction(
        error => {
          return this.logger.log(
            'failed to reschedule task with due date',
            error
          )
        },
        () => {
          return this.logger.log('successfully rescheduled tasks')
        }
      )
    )

    await runTask()
  }
}
