import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {format, startOfWeek, endOfWeek} from 'date-fns'
import {ScheduledTaskRepo} from './scheduled-task.repo'
import {ScheduleTaskDto} from './scheduled-task.model'
import {TasksService} from '../tasks/tasks.service'
import {isNull, reduce} from 'lodash/fp'
import {DefaultFetchedTaskGraph} from '../tasks/tasks.repository'
import {DBError} from 'db-errors'

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'

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

  async delete(uid: UID, dto: ScheduleTaskDto) {
    const isAuthor = await this.taskService.ensureAuthority(dto.task_id, uid)

    return isAuthor.asyncMap(() => this.scheduledTaskRepo.delete(dto))
  }

  async findByDate(uid: UID, date: string) {
    const result = await this.scheduledTaskRepo.findUserTasksByDate(uid, date)
    return result.map(this.temporary_extractTasks)
  }

  private temporary_extractTasks(
    scheduledTasks: Array<{task: DefaultFetchedTaskGraph | null}>
  ): Array<DefaultFetchedTaskGraph> {
    return reduce(
      (tasks, scheduled) => {
        if (!isNull(scheduled.task)) {
          tasks.push(scheduled.task)
        }

        return tasks
      },
      [] as Array<DefaultFetchedTaskGraph>,
      scheduledTasks
    )
  }

  async findTodayTasks(
    uid: UID
  ): EitherP<DBError, Array<DefaultFetchedTaskGraph>> {
    const today = format(new Date(), DEFAULT_DATE_FORMAT)
    const result = await this.scheduledTaskRepo.findUserTasksByDate(uid, today)

    return result.map(this.temporary_extractTasks)
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

    return result.map(this.temporary_extractTasks)
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
