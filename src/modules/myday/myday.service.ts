import {Injectable} from '@nestjs/common'
import {TaskIdT} from '../tasks/task.model'
import {TasksService} from '../tasks/tasks.service'
import {MyDayRepo} from './myday.repo'

@Injectable()
export class MyDayService {
  constructor(
    private readonly taskService: TasksService,
    private readonly myDayRepo: MyDayRepo
  ) {}

  async create(uid: UID, taskId: TaskIdT) {
    const isAuthor = await this.taskService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => this.myDayRepo.create(taskId))
  }

  async remove(uid: UID, taskId: TaskIdT) {
    const isAuthor = await this.taskService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => this.myDayRepo.remove(taskId))
  }

  findTodayTasksByUID(uid: UID) {
    return this.myDayRepo.findTodayTasksByUID(uid)
  }

}
