import {Inject, Injectable} from '@nestjs/common'
import {TaskIdT} from '../tasks/task.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  RejectedQueryError,
  transformRejectReason
} from '../../shared/transform-reject-reason'
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

  addTodo(dto: CreateTodoDto): TE.TaskEither<RejectedQueryError, TodoT> {
    return TE.tryCatch(() => {
      return this.checklistModel
        .query()
        .insert({
          task_id: dto.taskId,
          title: dto.title
        })
        .returning('*')
    }, transformRejectReason)
  }

  removeTodo(taskId: TaskIdT, todoId: TodoIdT) {
    return TE.tryCatch(() => {
      return this.checklistModel
        .query()
        .deleteById(todoId)
        .where({task_id: taskId})
        .throwIfNotFound()
    }, transformRejectReason)
  }

  findAllByTaskId(taskId: TaskIdT): TE.TaskEither<DBException, TodoT[]> {
    return TE.tryCatch(() => {
      return this.checklistModel
        .query()
        .where({
          task_id: taskId
        })
        .limit(100)
    }, transformRejectReason)
  }

  patchTodo(
    todoId: TodoIdT,
    patch: TodoPatchT
  ): TE.TaskEither<DBException, TodoT> {
    return TE.tryCatch(() => {
      return this.checklistModel
        .query()
        .patchAndFetchById(todoId, patch)
        .throwIfNotFound()
    }, transformRejectReason)
  }
}
