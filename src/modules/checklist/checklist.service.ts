import {Injectable} from '@nestjs/common'
import {TaskIdT} from '../tasks/task.model'
import {ChecklistRepo} from './checklist.repository'
import {CreateTodoDto} from './create-todo.dto'
import {TasksService} from '../tasks/tasks.service'

@Injectable()
export class ChecklistService {
  constructor(
    private readonly checklistRepo: ChecklistRepo,
    private readonly tasksService: TasksService
  ) {}

  addTodo(dto: CreateTodoDto) {
    return this.checklistRepo.addTodo(dto)
  }

  async findAllByTaskId(user: UserRecord, taskId: TaskIdT) {
    const isAuthor = await this.tasksService.ensureAuthority(taskId, user.uid)

    return isAuthor.asyncChain(() => this.checklistRepo.findAllByTaskId(taskId))
  }
}
