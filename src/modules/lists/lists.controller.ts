import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common'
import {doTask} from 'src/shared/do-task'
import {User} from 'src/decorators/user.decorator'
import {AuthGuard} from 'src/auth.guard'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {ListsService} from './lists.service'
import {CreateTaskListDto, createTaskListSchema, TaskList} from './list.model'

@Controller('lists')
@UseGuards(AuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @HttpCode(201)
  Create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskListSchema)) dto: CreateTaskListDto
  ) {
    return doTask(this.listsService.Create(uid, dto.title))
  }

  @Get()
  FindAll(@User('uid') uid: UID) {
    return this.listsService.FindAll(uid)
  }

  @Delete(':listId')
  Remove(
    @User('uid') uid: UID,
    @Param('listId', ParseIntPipe) listId: TaskList['id']
  ) {
    return this.listsService.Remove(uid, listId)
  }

  @Get(':listId/tasks')
  FindAllTasks(
    @User('uid') uid: UID,
    @Param('listId', ParseIntPipe) listId: TaskList['id']
  ) {
    return this.listsService.FindAllTasks(uid, listId)
  }
}
