import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  NotImplementedException,
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
import {TaskIdT} from '../tasks/task.model'
import {format} from 'date-fns'

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
    const result = await this.taskSchedulerService.create(uid, dto)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Post('schedule/today/:taskId')
  async scheduleForToday(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskIdT
  ): Promise<ScheduledTask> {
    const result = await this.taskSchedulerService.create(uid, {
      task_id: taskId,
      date: format(new Date(), 'yyyy-MM-dd')
    })

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Delete('schedule/:taskId')
  async unScheduleForToday(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskIdT
  ): Promise<number> {
    const result = await this.taskSchedulerService.delete(uid, {
      task_id: taskId,
      date: format(new Date(), 'yyyy-MM-dd')
    })

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Get('today')
  async findTodayTasks(@User('uid') uid: UID) {
    const result = await this.taskSchedulerService.findTodayTasks(uid)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Get('week')
  async findWeekTasks(@User('uid') uid: UID) {
    const result = await this.taskSchedulerService.findWeekTasks(uid)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Get()
  findAll() {
    throw new NotImplementedException()
  }

  @Get(':id')
  findOne() {
    throw new NotImplementedException()
  }

  @Patch(':id')
  update() {
    throw new NotImplementedException()
  }

  @Delete(':id')
  remove() {
    throw new NotImplementedException()
  }
}
