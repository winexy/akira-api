import {Injectable} from '@nestjs/common'
import {TaskId} from '../tasks/task.model'
import {ChecklistRepo} from './checklist.repository'
import {TasksService} from '../tasks/tasks.service'
import {CreateTodoDto, TodoIdT, TodoPatchT, TodoT} from './checklist.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {RejectedQueryError} from 'src/shared/transform-reject-reason'

@Injectable()
export class ChecklistService {
  constructor(
    private readonly checklistRepo: ChecklistRepo,
    private readonly tasksService: TasksService
  ) {}

  addTodo(dto: CreateTodoDto): TE.TaskEither<RejectedQueryError, TodoT> {
    return this.checklistRepo.addTodo(dto)
  }

  removeTodo(uid: UID, taskId: TaskId, todoId: TodoIdT) {
    return pipe(
      this.tasksService.ensureAuthority(taskId, uid),
      TE.chain(() => this.checklistRepo.removeTodo(taskId, todoId))
    )
  }

  findAllByTaskId(user: UserRecord, taskId: TaskId) {
    return pipe(
      this.tasksService.ensureAuthority(taskId, user.uid),
      TE.chain(() => this.checklistRepo.findAllByTaskId(taskId))
    )
  }

  patchTodo(uid: UID, taskId: TaskId, todoId: TodoIdT, patch: TodoPatchT) {
    return pipe(
      this.tasksService.ensureAuthority(taskId, uid),
      TE.chain(() => this.checklistRepo.patchTodo(todoId, patch))
    )
  }
}
