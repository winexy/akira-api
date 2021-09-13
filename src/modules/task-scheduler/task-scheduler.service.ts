import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {format, startOfWeek, endOfWeek} from 'date-fns'
import {ScheduledTaskRepo} from './scheduled-task.repo'
import {ScheduleTaskDto} from './scheduled-task.model'
import {TasksService} from '../tasks/tasks.service'
import {map} from 'lodash'
import {DefaultFetchedTaskGraph} from '../tasks/tasks.repository'

@Injectable()
export class TaskSchedulerService {
  constructor(
    @Inject(forwardRef(() => TasksService))
    private readonly taskService: TasksService,
    private readonly scheduledTaskRepo: ScheduledTaskRepo
  ) {}

  async create(uid: UID, dto: ScheduleTaskDto) {
    const isAuthor = await this.taskService.ensureAuthority(dto.task_id, uid)

    return isAuthor.asyncMap(() => this.scheduledTaskRepo.create(dto))
  }

  private getWeekRange(date: Date) {
    const weekConfig = {weekStartsOn: 1} as const

    return [
      format(startOfWeek(date, weekConfig), DEFAULT_DATE_FORMAT),
      format(endOfWeek(date, weekConfig), DEFAULT_DATE_FORMAT)
    ]
  }

  async findWeekTasks(
    uid: UID
  ): EitherP<Error | DBException, Array<DefaultFetchedTaskGraph>> {
    const [start, end] = this.getWeekRange(new Date())

    const result = await this.scheduledTaskRepo.findWeekTasks(uid, start, end)

    return result.map(map('task'))
  }

  findAll() {
    return `This action returns all taskScheduler`
  }

  findOne(id: number) {
    return `This action returns a #${id} taskScheduler`
  }

  update(id: number) {
    return `This action updates a #${id} taskScheduler`
  }

  remove(id: number) {
    return `This action removes a #${id} taskScheduler`
  }
}
