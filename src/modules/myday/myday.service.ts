import {Inject, Injectable, forwardRef, Logger} from '@nestjs/common'
import {Cron} from '@nestjs/schedule'
import {TasksService} from '../tasks/tasks.service'
import {MyDayRepo} from './myday.repo'
import {MyDaySyncRepo} from './myday-sync.repo'
import {TaskIdT} from '../tasks/task.model'

@Injectable()
export class MyDayService {
  private readonly logger = new Logger(MyDayService.name)

  constructor(
    @Inject(forwardRef(() => TasksService))
    private readonly taskService: TasksService,
    private readonly myDayRepo: MyDayRepo,
    private readonly myDaySyncRepo: MyDaySyncRepo
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
      await this.myDaySyncRepo.sync()
      this.logger.log('Success MyDay sync')
    } catch (error) {
      this.logger.error(`Failed to sync MyDay: ${error.message}`)
    }
  }
}
