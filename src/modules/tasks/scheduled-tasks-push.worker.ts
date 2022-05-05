import {Injectable} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'
import {pipe} from 'fp-ts/function'
import {firebase, messaging} from 'src/firebase'
import {TasksService} from './tasks.service'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import {WorkerSpec} from 'src/shared/app-worker'
import {UserError} from 'src/filters/user-error.exception.filter'

@Injectable()
export class ScheduledTasksPushWorker
  implements WorkerSpec<UserError | Error | firebase.messaging.BatchResponse> {
  constructor(private readonly tasksService: TasksService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    name: 'ScheduledTasksPushWorker',
    timeZone: process.env.TZ
  })
  async Worker() {
    await this.RunTask()
  }

  async RunTask() {
    const task = pipe(
      this.tasksService.CountTodayTasksByUsers(),
      TE.map(
        A.map(
          (entity): firebase.messaging.Message => ({
            notification: {
              title: 'Wake up!',
              body:
                entity.tasks_count === '1'
                  ? `You have one task to be done for today`
                  : `There are ${entity.tasks_count} tasks waiting for you for today`
            },
            token: entity.author.fcm_token
          })
        )
      ),
      TE.chainW(messages =>
        TE.tryCatch(
          () => messaging.sendAll(messages),
          reason => {
            return new Error(
              'Failed to send push notification. Reason: ' + reason
            )
          }
        )
      ),
      TE.toUnion
    )

    return task()
  }
}
