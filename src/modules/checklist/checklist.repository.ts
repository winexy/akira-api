import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {TaskIdT} from '../tasks/task.model'
import {ChecklistModel, TodoIdT} from './checklist.model'
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

  async removeTodo(taskId: TaskIdT, todoId: TodoIdT) {
    try {
      const result = await this.checklistModel
        .query()
        .deleteById(todoId)
        .where({task_id: taskId})
        .throwIfNotFound()

      return right(result)
    } catch (error) {
      return left(error)
    }
  }

  async findAllByTaskId(taskId: TaskIdT) {
    try {
      const result = await this.checklistModel
        .query()
        .where({
          task_id: taskId
        })
        .limit(100)

      return right(result)
    } catch (error) {
      return left(error)
    }
  }
}
