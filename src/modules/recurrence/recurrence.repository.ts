import {Inject, Injectable} from '@nestjs/common'
import {
  Recurrence,
  RecurrenceModel,
  RecurrenceWithTask
} from './recurrence.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {Transaction} from 'objection'
import {TaskId} from '../tasks/task.model'
import {InsertableRule} from './utils/map-to-insertable-rule'
import {TasksRepo} from '../tasks/tasks.repository'
import {UserError} from 'src/filters/user-error.exception.filter'
import {transformRejectReason} from '../../shared/transform-reject-reason'

@Injectable()
export class RecurrenceRepo {
  constructor(
    @Inject(RecurrenceModel)
    private readonly recurrenceModel: typeof RecurrenceModel,
    private readonly tasksRepo: TasksRepo
  ) {}

  createRecurrence(
    uid: UID,
    taskId: TaskId,
    insertableRule: InsertableRule
  ): TE.TaskEither<UserError, Recurrence> {
    return TE.tryCatch(
      () => {
        return this.recurrenceModel.transaction(async trx => {
          const recurrence = await this.insertRecurrence(
            uid,
            taskId,
            insertableRule,
            trx
          )

          const updateTask = this.tasksRepo.update(
            taskId,
            uid,
            {
              recurrence_id: recurrence.id
            },
            trx
          )

          await updateTask()

          return recurrence
        })
      },
      reason =>
        UserError.of({
          type: 'unknown',
          message: 'Failed to create recurrence',
          meta: {
            reason
          }
        })
    )
  }

  private insertRecurrence(
    uid: UID,
    taskId: TaskId,
    insertableRule: InsertableRule,
    trx: Transaction
  ) {
    return this.recurrenceModel.query(trx).insert({
      next_date: insertableRule.next,
      rule: insertableRule.rule,
      source_task_id: taskId,
      author_uid: uid
    })
  }

  findByNextDateWithGraphFetched(
    date: Date
  ): TE.TaskEither<UserError, RecurrenceWithTask[]> {
    return TE.tryCatch(() => {
      const query = this.recurrenceModel
        .query()
        .where({next_date: date.toISOString()})
        .withGraphFetched('task')

      return (query as unknown) as Promise<RecurrenceWithTask[]>
    }, transformRejectReason)
  }
}
