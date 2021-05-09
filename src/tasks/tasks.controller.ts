import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import {TasksService} from './tasks.service'
import {AuthGuard} from '../auth.guard'
import {CreateTaskDto} from './create-task.dto'
import {FujiPipe} from '../pipes/fuji.pipe'
import {createTaskDtoSchema} from './schemas'
import {User} from 'src/decorators/user.decorator'

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new FujiPipe(createTaskDtoSchema)) taskDto: CreateTaskDto) {
    return this.taskService.create(taskDto)
  }

  @Get()
  findAll(@User() user: UserRecord) {
    return this.taskService.findAllByUID(user.uid)
  }

  @Get(':id')
  findOne(@User() user: UserRecord, @Param('id') id: string) {
    return this.taskService.findOne(id, user.uid)
  }
}
