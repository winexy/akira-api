import {Body, Controller, Post} from '@nestjs/common'
import {ChecklistService} from './checklist.service'
import {CreateTodoDto, createTodoDtoSchema} from './create-todo.dto'
import {FujiPipe} from '../../pipes/fuji.pipe'

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
}
