import {Injectable} from '@nestjs/common'
import {TaskIdT} from '../tasks/task.model'
import {TasksService} from '../tasks/tasks.service'
import {TodayRepo} from './today.repo'

@Injectable()
export class TodayService {
  constructor(
    private readonly taskService: TasksService,
    private readonly todayRepo: TodayRepo
  ) {}

  async create(uid: UID, taskId: TaskIdT) {
    const isAuthor = await this.taskService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => this.todayRepo.create(taskId))
  }

  async remove(uid: UID, taskId: TaskIdT) {
    const isAuthor = await this.taskService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => this.todayRepo.remove(taskId))
  }
}
