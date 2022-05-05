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
import {SuperUserGuard} from 'src/superuser.guard'
import {RecurrenceWorker} from './recurrence.worker'
import {doTask} from 'src/shared/do-task'

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
    return this.recurrenceWorker.RunTask()
  }

  @Post(':taskId')
  Create(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Body(FujiPipe.of(ruleSchema)) dto: RuleSchema
  ) {
    return doTask(this.recurrenceService.Create(uid, taskId, dto))
  }

  @Delete(':id')
  RemoveRecurrence(
    @User('uid') uid: UID,
    @Param('id', ParseIntPipe) recurrenceId: number
  ) {
    return doTask(this.recurrenceService.RemoveRecurrence(recurrenceId, uid))
  }

  @Get('tasks')
  GetUserTasks(@User('uid') uid: UID) {
    return doTask(this.recurrenceService.GetUserTasks(uid))
  }
}
