import {Body, Controller, HttpCode, Post} from '@nestjs/common'
import {User} from 'src/decorators/user.decorator'
import {TaskListsService} from './task-lists.service'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {CreateTaskListDto, createTaskListSchema} from './task-list.model'

@Controller('task-lists')
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) {}

  @Post()
  @HttpCode(201)
  create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskListSchema)) dto: CreateTaskListDto
  ) {
    return this.taskListsService.createTaskList(uid, dto)
  }
}
