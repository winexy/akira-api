import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common'
import {ChecklistService} from './checklist.service'
import {CreateTodoDto, createTodoDtoSchema} from './create-todo.dto'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {User} from 'src/decorators/user.decorator'
import {TaskIdT} from '../tasks/task.model'
import {AuthGuard} from '../../auth.guard'
import {TodoIdT} from './checklist.model'

@UseGuards(AuthGuard)
@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post()
  async addTodo(@Body(new FujiPipe(createTodoDtoSchema)) body: CreateTodoDto) {
    const result = await this.checklistService.addTodo(body)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Get('/:taskId')
  async findAllByTaskId(
    @User() user: UserRecord,
    @Param('taskId') taskId: TaskIdT
  ) {
    const result = await this.checklistService.findAllByTaskId(user, taskId)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
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
    )

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }
}
