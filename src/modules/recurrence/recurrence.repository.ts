import {Inject, Injectable} from '@nestjs/common'
import {Recurrence, RecurrenceModel} from './recurrence.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {Transaction} from 'objection'
import {TaskId} from '../tasks/task.model'
import {InsertableRule} from './utils/map-to-insertable-rule'
import {TasksRepo} from '../tasks/tasks.repository'
import {UserError} from 'src/filters/user-error.exception.filter'
import {taskEitherQuery} from 'src/shared/task-either-query'
import {pipe} from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'

@Injectable()
export class RecurrenceRepo {
  constructor(
    @Inject(RecurrenceModel)
    private readonly recurrenceModel: typeof RecurrenceModel,
    private readonly tasksRepo: TasksRepo
  ) {}

  CreateRecurrence(
    uid: UID,
    taskId: TaskId,
    insertableRule: InsertableRule
  ): TE.TaskEither<UserError, Recurrence> {
    return taskEitherQuery(() => {
      return this.recurrenceModel.transaction(async trx => {
        const result = await pipe(
          this.InsertRecurrence(trx)(uid, taskId, insertableRule),
          TE.chainFirst(recurrence =>
            this.tasksRepo.Update(trx)(taskId, uid, {
              recurrence_id: recurrence.id
            })
          )
        )()

        if (E.isLeft(result)) {
          throw result.left
        }

        return result.right
      })
    })
  }

  private InsertRecurrence(trx?: Transaction) {
    return (uid: UID, taskId: TaskId, insertableRule: InsertableRule) => {
      return taskEitherQuery(() => {
        return this.recurrenceModel.query(trx).insert({
          next_date: insertableRule.next,
          rule: insertableRule.rule,
          source_task_id: taskId,
          author_uid: uid
        })
      })
    }
  }

  FindByNextDate(trx?: Transaction) {
    return (nextDate: string): TE.TaskEither<UserError, Recurrence[]> => {
      return taskEitherQuery(() => {
        const query = this.recurrenceModel
          .query(trx)
          .where({next_date: nextDate})

        return (query as unknown) as Promise<Recurrence[]>
      })
    }
  }

  UpdateNextDate(trx?: Transaction) {
    return ({id, nextDate}: {id: number; nextDate: string}) => {
      return taskEitherQuery(() => {
        return this.recurrenceModel
          .query(trx)
          .patch({next_date: nextDate})
          .where({id})
          .limit(1)
      })
    }
  }
}
