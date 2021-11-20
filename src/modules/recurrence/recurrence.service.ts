import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {Transaction} from 'objection'
import {TaskId} from '../tasks/task.model'
import {RuleSchema} from './recurrence.model'
import {TasksService} from '../tasks/tasks.service'
import {RecurrenceRepo} from './recurrence.repository'
import {mapToInsertableRule} from './utils/map-to-insertable-rule'
import {
  isUniqueViolation,
  UserError
} from 'src/filters/user-error.exception.filter'
import {formatISO} from 'date-fns'

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
  ): TE.TaskEither<UserError, void> {
    const patchExistingRecurrence = (
      error: UserError
    ): TE.TaskEither<UserError, void> => {
      return isUniqueViolation(error)
        ? pipe(
            mapToInsertableRule(dto),
            this.recurrenceRepo.PatchByTaskId(taskId)
          )
        : TE.throwError(error)
    }

    return pipe(
      this.taskService.EnsureAuthority(taskId, uid),
      TE.map(() => mapToInsertableRule(dto)),
      TE.chain(this.recurrenceRepo.CreateRecurrence(uid)(taskId)),
      TE.orElseW(patchExistingRecurrence)
    )
  }

  FindRecurrentForToday(trx?: Transaction) {
    return pipe(formatISO(new Date()), this.recurrenceRepo.FindByNextDate(trx))
  }

  UpdateNextDate(trx?: Transaction) {
    return this.recurrenceRepo.UpdateNextDate(trx)
  }

  GetUserTasks(uid: UID) {
    return this.recurrenceRepo.GetUserTasks(uid)
  }

  RemoveRecurrence(recurrenceId: number, uid: UID) {
    return this.recurrenceRepo.RemoveRecurrence(recurrenceId, uid)
  }
}
