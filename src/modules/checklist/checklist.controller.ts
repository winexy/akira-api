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
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {User} from 'src/decorators/user.decorator'
import {TaskId} from '../tasks/task.model'
import {doTask} from 'src/shared/do-task'
import {AuthGuard} from 'src/auth.guard'
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
  AddTodo(@Body(FujiPipe.of(createTodoDtoSchema)) body: CreateTodoDto) {
    return doTask(this.checklistService.addTodo(body))
  }

  @Get('/:taskId')
  FindAllByTaskId(@User() user: UserRecord, @Param('taskId') taskId: TaskId) {
    return doTask(this.checklistService.findAllByTaskId(user, taskId))
  }

  @Delete('/:taskId/:todoId')
  removeTodo(
    @User() user: UserRecord,
    @Param('taskId') taskId: TaskId,
    @Param('todoId', ParseIntPipe) todoId: TodoIdT
  ) {
    return doTask(this.checklistService.removeTodo(user.uid, taskId, todoId))
  }

  @Patch(':taskId/:todoId')
  patchTodo(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('todoId', ParseIntPipe) todoId: TodoIdT,
    @Body(FujiPipe.of(todoPatchSchema)) patch: TodoPatchT
  ) {
    return doTask(this.checklistService.patchTodo(uid, taskId, todoId, patch))
  }
}
