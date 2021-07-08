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
import {User} from 'src/decorators/user.decorator'
import {ListsService} from './lists.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {CreateTaskListDto, createTaskListSchema, TaskList} from './list.model'

@Controller('lists')
@UseGuards(AuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @HttpCode(201)
  create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskListSchema)) dto: CreateTaskListDto
  ) {
    return this.listsService.create(uid, dto.title)
  }

  @Get()
  findAll(@User('uid') uid: UID) {
    return this.listsService.findAll(uid)
  }

  @Delete(':listId')
  remove(
    @User('uid') uid: UID,
    @Param('listId', ParseIntPipe) listId: TaskList['id']
  ) {
    return this.listsService.remove(uid, listId)
  }

  @Get(':listId/tasks')
  findAllTasks(
    @User('uid') uid: UID,
    @Param('listId', ParseIntPipe) listId: TaskList['id']
  ) {
    return this.listsService.findAllTasks(uid, listId)
  }
}
