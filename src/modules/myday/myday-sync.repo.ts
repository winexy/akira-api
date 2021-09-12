import {Inject, Injectable, Logger} from '@nestjs/common'
import {TasksRepo} from '../tasks/tasks.repository'
import {ScheduledTaskRepo} from '../task-scheduler/scheduled-task.repo'
import {MyDayModel} from './myday.model'
import {MyDayRepo} from './myday.repo'
import {format} from 'date-fns'
import {isEmpty, map, size} from 'lodash'

@Injectable()
export class MyDaySyncRepo {
  private readonly logger = new Logger(MyDaySyncRepo.name)

  constructor(
    @Inject(MyDayModel)
    private readonly myDayModel: typeof MyDayModel,
    private readonly tasksRepo: TasksRepo,
    private readonly myDayRepo: MyDayRepo,
    private readonly scheduledTaskRepo: ScheduledTaskRepo
  ) {}

  sync() {
    return this.myDayModel.transaction(async trx => {
      this.logger.log('Starting MyDay sync transaction')

      const count = await this.myDayRepo.resetMyDay(trx)
      this.logger.log(`Removed ${count} tasks from myday`)

      const today = format(new Date(), 'yyyy-MM-dd')

      this.logger.log(`Querying scheduled tasks for ${today}`)

      const scheduled = await this.scheduledTaskRepo.findByDate(today, trx)
      const taskIds = map(scheduled, 'task_id')

      if (isEmpty(scheduled)) {
        this.logger.log('No tasks were scheduled. Finishing job')
        return
      }

      this.logger.log(`Found ${size(scheduled)} tasks`)

      const tasks = await this.tasksRepo.findAllByIds(taskIds, trx)

      await this.myDayRepo.insertBatch(tasks, trx)

      this.logger.log(`Inserted ${size(tasks)} to MyDay`)
    })
  }
}
