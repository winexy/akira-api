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
import * as E from 'fp-ts/lib/Either'

@Controller('lists')
@UseGuards(AuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @HttpCode(201)
  async create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskListSchema)) dto: CreateTaskListDto
  ) {
    const result = await this.listsService.create(uid, dto.title)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
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
