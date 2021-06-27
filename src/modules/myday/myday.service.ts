import {Inject, Injectable, forwardRef} from '@nestjs/common'
import {Cron} from '@nestjs/schedule'
import {TaskIdT} from '../tasks/task.model'
import {TasksService} from '../tasks/tasks.service'
import {MyDayRepo} from './myday.repo'

@Injectable()
export class MyDayService {
  constructor(
    @Inject(forwardRef(() => TasksService))
    private readonly taskService: TasksService,
    private readonly myDayRepo: MyDayRepo
  ) {}

  async create(uid: UID, taskId: TaskIdT) {
    const isAuthor = await this.taskService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => this.myDayRepo.create(uid, taskId))
  }

  async remove(uid: UID, taskId: TaskIdT) {
    const isAuthor = await this.taskService.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => this.myDayRepo.remove(taskId))
  }

  findAll(uid: UID) {
    return this.myDayRepo.findTodayTasksByUID(uid)
  }

  @Cron('0 0 * * *')
  async updateMyDay() {
    try {
      const count = await this.myDayRepo.resetMyDay()
      global.console.log(
        new Date().toTimeString(),
        `:: removed ${count} tasks from myday`
      )
    } catch (error) {
      global.console.error(error.message)
    }
  }
}
