import {Body, Controller, Param, Post} from '@nestjs/common'
import {ChecklistService} from './checklist.service'
import {CreateTodoDto, createTodoDtoSchema} from './create-todo.dto'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {TaskIdT} from '../tasks/task.model'

@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post('/:taskId')
  async addTodo(
    @Param('taskId') taskId: TaskIdT,
    @Body(new FujiPipe(createTodoDtoSchema)) body: CreateTodoDto
  ) {
    const result = await this.checklistService.addTodo({...body, taskId})

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }
}
