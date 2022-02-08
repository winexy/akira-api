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
import {TasksService} from '../tasks/tasks.service'
import {doTask} from 'src/shared/do-task'

@Controller('task-scheduler')
@UseGuards(AuthGuard)
export class TaskSchedulerController {
  constructor(private readonly taskService: TasksService) {}

  @Post('schedule')
  create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(scheduleTaskSchema))
    dto: ScheduleTaskDto
  ) {
    return doTask(
      this.taskService.PatchTask(uid, dto.task_id, {
        date: dto.date
      })
    )
  }

  @Post('schedule/today/:taskId')
  scheduleForToday(@User('uid') uid: UID, @Param('taskId') taskId: TaskId) {
    return doTask(
      this.taskService.PatchTask(uid, taskId, {
        date: format(new Date(), 'yyyy-MM-dd')
      })
    )
  }

  @Delete('schedule/:taskId')
  UnScheduleForToday(@User('uid') uid: UID, @Param('taskId') taskId: TaskId) {
    return doTask(
      this.taskService.PatchTask(uid, taskId, {
        date: null
      })
    )
  }

  @Get('today')
  FindTodayTasks(@User('uid') uid: UID) {
    return doTask(this.taskService.FindTodayTasks()(uid))
  }

  @Get('week')
  FindWeekTasks(@User('uid') uid: UID) {
    return doTask(this.taskService.FindWeekTasks()(uid))
  }
}
