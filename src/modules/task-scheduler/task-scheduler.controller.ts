import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Param
} from '@nestjs/common'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {AuthGuard} from '../../auth.guard'
import {TaskSchedulerService} from './task-scheduler.service'
import {
  scheduleTaskSchema,
  ScheduleTaskDto,
  ScheduledTask
} from './scheduled-task.model'
import {User} from 'src/decorators/user.decorator'
import {TaskId} from '../tasks/task.model'
import {format} from 'date-fns'
import * as E from 'fp-ts/lib/Either'

@Controller('task-scheduler')
@UseGuards(AuthGuard)
export class TaskSchedulerController {
  constructor(private readonly taskSchedulerService: TaskSchedulerService) {}

  @Post('schedule')
  async create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(scheduleTaskSchema))
    dto: ScheduleTaskDto
  ): Promise<ScheduledTask> {
    const result = await this.taskSchedulerService.create(uid, dto)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Post('schedule/today/:taskId')
  async scheduleForToday(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId
  ): Promise<ScheduledTask> {
    const result = await this.taskSchedulerService.create(uid, {
      task_id: taskId,
      date: format(new Date(), 'yyyy-MM-dd')
    })()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Delete('schedule/:taskId')
  async unScheduleForToday(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId
  ): Promise<number> {
    const result = await this.taskSchedulerService.delete(uid, {
      task_id: taskId,
      date: format(new Date(), 'yyyy-MM-dd')
    })()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('today')
  async findTodayTasks(@User('uid') uid: UID) {
    const result = await this.taskSchedulerService.findTodayTasks(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('week')
  async findWeekTasks(@User('uid') uid: UID) {
    const result = await this.taskSchedulerService.findWeekTasks(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
