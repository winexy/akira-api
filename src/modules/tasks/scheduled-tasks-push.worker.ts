import {Injectable} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'
import {pipe} from 'fp-ts/function'
import {firebase, messaging} from 'src/firebase'
import {TasksService} from './tasks.service'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import {WorkerSpec} from 'src/shared/app-worker'
import {UserError} from 'src/filters/user-error.exception.filter'
import * as R from 'fp-ts/lib/Record'
import {UsersService} from 'src/modules/users/users.service'
import {UserEntity} from '../users/users.model'
import {TaskCountByUserId} from './utils/combine-user-task-count'

const collectDataSource = (taskCountByUID: TaskCountByUserId) => {
  type DataSource = Array<{uid: string; fcmToken: string; taskCount: number}>

  return A.reduce([] as DataSource, (ds, user: UserEntity) => {
    ds.push({
      uid: user.uid,
      fcmToken: user.fcm_token,
      taskCount: taskCountByUID[user.uid]
    })

    return ds
  })
}

@Injectable()
export class ScheduledTasksPushWorker
  implements WorkerSpec<UserError | Error | firebase.messaging.BatchResponse> {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    name: 'ScheduledTasksPushWorker',
    timeZone: process.env.TZ
  })
  async Worker() {
    await this.RunTask()
  }

  async RunTask() {
    const task = pipe(
      this.tasksService.CountCombinedTodayTasks(),
      TE.chain(taskCountByUID =>
        pipe(
          R.keys(taskCountByUID),
          this.usersService.FindUsersByIds(),
          TE.map(collectDataSource(taskCountByUID))
        )
      ),
      TE.map(
        A.map(
          (data): firebase.messaging.Message => ({
            notification: {
              title: 'Wake up!',
              body:
                data.taskCount === 1
                  ? `You have one task to be done for today`
                  : `There are ${data.taskCount} tasks waiting for you for today`
            },
            token: data.fcmToken
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
