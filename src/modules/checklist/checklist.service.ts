import {Injectable} from '@nestjs/common'
import {TaskIdT} from '../tasks/task.model'
import {ChecklistRepo} from './checklist.repository'
import {CreateTodoDto} from './create-todo.dto'
import {TasksService} from '../tasks/tasks.service'
import {TodoIdT, TodoPatchT} from './checklist.model'

@Injectable()
export class ChecklistService {
  constructor(
    private readonly checklistRepo: ChecklistRepo,
    private readonly tasksService: TasksService
  ) {}

  addTodo(dto: CreateTodoDto) {
    return this.checklistRepo.addTodo(dto)
  }

  async removeTodo(uid: UID, taskId: TaskIdT, todoId: TodoIdT) {
    const isAuthor = await this.tasksService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => {
      return this.checklistRepo.removeTodo(taskId, todoId)
    })
  }

  async findAllByTaskId(user: UserRecord, taskId: TaskIdT) {
    const isAuthor = await this.tasksService.ensureAuthority(taskId, user.uid)

    return isAuthor.asyncChain(() => this.checklistRepo.findAllByTaskId(taskId))
  }

  async patchTodo(
    uid: UID,
    taskId: TaskIdT,
    todoId: TodoIdT,
    patch: TodoPatchT
  ) {
    const isAuthor = await this.tasksService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() =>
      this.checklistRepo.patchTodo(todoId, patch)
    )
  }
}
