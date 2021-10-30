import {Injectable} from '@nestjs/common'
import {TaskId} from '../tasks/task.model'
import {ChecklistRepo} from './checklist.repository'
import {TasksService} from '../tasks/tasks.service'
import {CreateTodoDto, TodoIdT, TodoPatchT, TodoT} from './checklist.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {UserError} from 'src/filters/user-error.exception.filter'

@Injectable()
export class ChecklistService {
  constructor(
    private readonly checklistRepo: ChecklistRepo,
    private readonly tasksService: TasksService
  ) {}

  addTodo(dto: CreateTodoDto): TE.TaskEither<UserError, TodoT> {
    return this.checklistRepo.addTodo(dto)
  }

  removeTodo(uid: UID, taskId: TaskId, todoId: TodoIdT) {
    return pipe(
      this.tasksService.EnsureAuthority(taskId, uid),
      TE.chain(() => this.checklistRepo.removeTodo(taskId, todoId))
    )
  }

  findAllByTaskId(user: UserRecord, taskId: TaskId) {
    return pipe(
      this.tasksService.EnsureAuthority(taskId, user.uid),
      TE.chain(() => this.checklistRepo.findAllByTaskId(taskId))
    )
  }

  patchTodo(uid: UID, taskId: TaskId, todoId: TodoIdT, patch: TodoPatchT) {
    return pipe(
      this.tasksService.EnsureAuthority(taskId, uid),
      TE.chain(() => this.checklistRepo.patchTodo(todoId, patch))
    )
  }
}
