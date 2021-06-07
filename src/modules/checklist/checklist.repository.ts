import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {ChecklistModel} from './checklist.model'
import {CreateTodoDto} from './create-todo.dto'

@Injectable()
export class ChecklistRepo {
  constructor(
    @Inject(ChecklistModel)
    private readonly checklistModel: typeof ChecklistModel
  ) {}

  async addTodo(dto: CreateTodoDto) {
    try {
      const todo = await this.checklistModel
        .query()
        .insert({
          task_id: dto.taskId,
          title: dto.title
        })
        .returning('*')

      return right(todo)
    } catch (error) {
      return left(error)
    }
  }
}
