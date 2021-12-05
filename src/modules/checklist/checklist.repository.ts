import {Inject, Injectable} from '@nestjs/common'
import {TaskId} from '../tasks/task.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from '../../filters/user-error.exception.filter'
import {
  ChecklistModel,
  CreateTodoDto,
  TodoIdT,
  TodoPatchT,
  TodoT
} from './checklist.model'
import {taskEitherQuery} from 'src/shared/task-either-query'

@Injectable()
export class ChecklistRepo {
  constructor(
    @Inject(ChecklistModel)
    private readonly checklistModel: typeof ChecklistModel
  ) {}

  addTodo(dto: CreateTodoDto): TE.TaskEither<UserError, TodoT> {
    return taskEitherQuery(() => {
      return this.checklistModel
        .query()
        .insert({
          task_id: dto.taskId,
          title: dto.title
        })
        .returning('*')
    })
  }

  removeTodo(taskId: TaskId, todoId: TodoIdT) {
    return taskEitherQuery(() => {
      return this.checklistModel
        .query()
        .deleteById(todoId)
        .where({task_id: taskId})
        .throwIfNotFound()
    })
  }

  findAllByTaskId(taskId: TaskId): TE.TaskEither<UserError, TodoT[]> {
    return taskEitherQuery(() => {
      return this.checklistModel
        .query()
        .where({
          task_id: taskId
        })
        .limit(100)
    })
  }

  patchTodo(
    todoId: TodoIdT,
    patch: TodoPatchT
  ): TE.TaskEither<UserError, TodoT> {
    return taskEitherQuery(() => {
      return this.checklistModel
        .query()
        .patchAndFetchById(todoId, patch)
        .throwIfNotFound()
    })
  }
}
