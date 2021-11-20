import {
  Controller,
  Post,
  Param,
  UseGuards,
  Body,
  Get,
  Delete,
  ParseIntPipe
} from '@nestjs/common'
import {RecurrenceService} from './recurrence.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {ruleSchema, RuleSchema} from './recurrence.model'
import {TaskId} from '../tasks/task.model'
import {User} from 'src/decorators/user.decorator'
import * as E from 'fp-ts/lib/Either'
import {SuperUserGuard} from 'src/superuser.guard'
import {RecurrenceWorker} from './recurrence.worker'

@UseGuards(AuthGuard)
@Controller('recurrence')
export class RecurrenceController {
  constructor(
    private readonly recurrenceService: RecurrenceService,
    private readonly recurrenceWorker: RecurrenceWorker
  ) {}

  @Post('hook')
  @UseGuards(SuperUserGuard)
  Hook() {
    return this.recurrenceWorker.syncRecurrentTasks()
  }

  @Post(':taskId')
  async Create(
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

  @Delete(':id')
  async RemoveRecurrence(
    @User('uid') uid: UID,
    @Param('id', ParseIntPipe) recurrenceId: number
  ) {
    const result = await this.recurrenceService.RemoveRecurrence(
      recurrenceId,
      uid
    )()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('tasks')
  async GetUserTasks(@User('uid') uid: UID) {
    const result = await this.recurrenceService.GetUserTasks(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
