import {Controller, Post, Param, UseGuards, Body} from '@nestjs/common'
import {RecurrenceService} from './recurrence.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {ruleSchema, RuleSchema} from './recurrence.model'
import {TaskId} from '../tasks/task.model'
import {User} from 'src/decorators/user.decorator'
import * as E from 'fp-ts/lib/Either'

@UseGuards(AuthGuard)
@Controller('recurrence')
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post(':taskId')
  async create(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Body(FujiPipe.of(ruleSchema)) dto: RuleSchema
  ) {
    const result = await this.recurrenceService.Create(uid, taskId, dto)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
