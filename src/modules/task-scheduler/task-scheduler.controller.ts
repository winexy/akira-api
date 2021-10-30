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
import {scheduleTaskSchema, ScheduleTaskDto} from './scheduled-task.model'
import {User} from 'src/decorators/user.decorator'
import {TaskId} from '../tasks/task.model'
import {format} from 'date-fns'
import * as E from 'fp-ts/lib/Either'
import {TasksService} from '../tasks/tasks.service'

@Controller('task-scheduler')
@UseGuards(AuthGuard)
export class TaskSchedulerController {
  constructor(private readonly taskService: TasksService) {}

  @Post('schedule')
  async create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(scheduleTaskSchema))
    dto: ScheduleTaskDto
  ) {
    const result = await this.taskService.PatchTask(uid, dto.task_id, {
      date: dto.date
    })()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Post('schedule/today/:taskId')
  async scheduleForToday(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId
  ) {
    const result = await this.taskService.PatchTask(uid, taskId, {
      date: format(new Date(), 'yyyy-MM-dd')
    })()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Delete('schedule/:taskId')
  async UnScheduleForToday(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId
  ) {
    const result = await this.taskService.PatchTask(uid, taskId, {
      date: null
    })()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('today')
  async findTodayTasks(@User('uid') uid: UID) {
    const result = await this.taskService.FindTodayTasks()(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('week')
  async FindWeekTasks(@User('uid') uid: UID) {
    const result = await this.taskService.FindWeekTasks()(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
