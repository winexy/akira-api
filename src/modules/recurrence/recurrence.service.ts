import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {TaskId} from '../tasks/task.model'
import {RuleSchema, Recurrence} from './recurrence.model'
import {TasksService} from '../tasks/tasks.service'
import {RecurrenceRepo} from './recurrence.repository'
import {mapToInsertableRule} from './utils/map-to-insertable-rule'
import {UserError} from 'src/filters/user-error.exception.filter'

@Injectable()
export class RecurrenceService {
  constructor(
    private readonly taskService: TasksService,
    private readonly recurrenceRepo: RecurrenceRepo
  ) {}

  create(
    uid: UID,
    taskId: TaskId,
    dto: RuleSchema
  ): TE.TaskEither<UserError, Recurrence> {
    return pipe(
      this.taskService.ensureAuthority(taskId, uid),
      TE.chainEitherK(() => mapToInsertableRule(dto)),
      TE.chain(rule => this.recurrenceRepo.createRecurrence(uid, taskId, rule))
    )
  }

  findAll() {
    return `This action returns all recurrence`
  }

  findOne(id: number) {
    return `This action returns a #${id} recurrence`
  }

  update(id: number) {
    return `This action updates a #${id} recurrence`
  }

  remove(id: number) {
    return `This action removes a #${id} recurrence`
  }
}
