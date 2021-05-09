import {Body, Controller, HttpCode, Post, UseGuards} from '@nestjs/common'
import {TasksService} from './tasks.service'
import {AuthGuard} from '../auth.guard'
import {CreateTaskDto} from './create-task.dto'
import {FujiPipe} from '../pipes/fuji.pipe'
import {createTaskDtoSchema} from './schemas'

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new FujiPipe(createTaskDtoSchema)) taskDto: CreateTaskDto) {
    return this.taskService.create(taskDto)
  }
}
