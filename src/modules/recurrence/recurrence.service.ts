import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {TaskId} from '../tasks/task.model'
import {RuleSchema, Recurrence} from './recurrence.model'
import {TasksService} from '../tasks/tasks.service'
import {RecurrenceRepo} from './recurrence.repository'
import {mapToInsertableRule} from './utils/map-to-insertable-rule'
import {UserError} from 'src/filters/user-error.exception.filter'
import {Transaction} from 'objection'

@Injectable()
export class RecurrenceService {
  constructor(
    private readonly taskService: TasksService,
    private readonly recurrenceRepo: RecurrenceRepo
  ) {}

  Create(
    uid: UID,
    taskId: TaskId,
    dto: RuleSchema
  ): TE.TaskEither<UserError, Recurrence> {
    return pipe(
      this.taskService.EnsureAuthority(taskId, uid),
      TE.map(mapToInsertableRule(dto)),
      TE.chain(rule => this.recurrenceRepo.CreateRecurrence(uid, taskId, rule))
    )
  }

  FindRecurrentForToday(trx?: Transaction) {
    return pipe(
      new Date().toISOString(),
      this.recurrenceRepo.FindByNextDate(trx)
    )
  }

  UpdateNextDate(trx?: Transaction) {
    return this.recurrenceRepo.UpdateNextDate(trx)
  }
}
