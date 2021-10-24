import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import {ChecklistService} from './checklist.service'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {User} from 'src/decorators/user.decorator'
import {TaskIdT} from '../tasks/task.model'
import {AuthGuard} from '../../auth.guard'
import * as E from 'fp-ts/lib/Either'
import {
  CreateTodoDto,
  createTodoDtoSchema,
  TodoIdT,
  todoPatchSchema,
  TodoPatchT
} from './checklist.model'

@UseGuards(AuthGuard)
@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post()
  async addTodo(@Body(FujiPipe.of(createTodoDtoSchema)) body: CreateTodoDto) {
    const result = await this.checklistService.addTodo(body)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('/:taskId')
  async findAllByTaskId(
    @User() user: UserRecord,
    @Param('taskId') taskId: TaskIdT
  ) {
    const result = await this.checklistService.findAllByTaskId(user, taskId)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Delete('/:taskId/:todoId')
  async removeTodo(
    @User() user: UserRecord,
    @Param('taskId') taskId: TaskIdT,
    @Param('todoId', ParseIntPipe) todoId: TodoIdT
  ) {
    const result = await this.checklistService.removeTodo(
      user.uid,
      taskId,
      todoId
    )()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Patch(':taskId/:todoId')
  async patchTodo(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskIdT,
    @Param('todoId', ParseIntPipe) todoId: TodoIdT,
    @Body(FujiPipe.of(todoPatchSchema)) patch: TodoPatchT
  ) {
    const result = await this.checklistService.patchTodo(
      uid,
      taskId,
      todoId,
      patch
    )()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
