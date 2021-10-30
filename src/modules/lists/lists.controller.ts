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
  async Create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskListSchema)) dto: CreateTaskListDto
  ) {
    const result = await this.listsService.Create(uid, dto.title)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
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
