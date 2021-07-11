import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  NotImplementedException,
  UseGuards
} from '@nestjs/common'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {AuthGuard} from '../../auth.guard'
import {TaskSchedulerService} from './task-scheduler.service'
import {scheduleTaskSchema, ScheduleTaskDto} from './scheduled-task.model'
import {User} from 'src/decorators/user.decorator'

@Controller('task-scheduler')
@UseGuards(AuthGuard)
export class TaskSchedulerController {
  constructor(private readonly taskSchedulerService: TaskSchedulerService) {}

  @Post('schedule')
  create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(scheduleTaskSchema))
    dto: ScheduleTaskDto
  ) {
    return this.taskSchedulerService.create(uid, dto)
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
