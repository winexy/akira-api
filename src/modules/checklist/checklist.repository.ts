import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {TaskIdT} from '../tasks/task.model'
import {
  ChecklistModel,
  CreateTodoDto,
  TodoIdT,
  TodoPatchT,
  TodoT
} from './checklist.model'

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

  async findAllByTaskId(taskId: TaskIdT): EitherP<DBException, TodoT[]> {
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

  async patchTodo(
    todoId: TodoIdT,
    patch: TodoPatchT
  ): EitherP<DBException, TodoT> {
    try {
      const result = await this.checklistModel
        .query()
        .patchAndFetchById(todoId, patch)
        .throwIfNotFound()

      return right(result)
    } catch (error) {
      return left(error)
    }
  }
}
