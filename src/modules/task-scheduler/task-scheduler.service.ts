import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {format, startOfWeek, endOfWeek} from 'date-fns'
import {ScheduledTaskRepo} from './scheduled-task.repo'
import {ScheduleTaskDto} from './scheduled-task.model'
import {TasksService} from '../tasks/tasks.service'
import {isNull, reduce} from 'lodash/fp'
import {DefaultFetchedTaskGraph} from '../tasks/tasks.repository'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {UserError} from 'src/filters/user-error.exception.filter'

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'

@Injectable()
export class TaskSchedulerService {
  constructor(
    @Inject(forwardRef(() => TasksService))
    private readonly taskService: TasksService,
    private readonly scheduledTaskRepo: ScheduledTaskRepo
  ) {}

  create(uid: UID, dto: ScheduleTaskDto) {
    return pipe(
      this.taskService.ensureAuthority(dto.task_id, uid),
      TE.chain(() => this.scheduledTaskRepo.create(dto))
    )
  }

  delete(uid: UID, dto: ScheduleTaskDto) {
    return pipe(
      this.taskService.ensureAuthority(dto.task_id, uid),
      TE.chain(() => this.scheduledTaskRepo.delete(dto))
    )
  }

  findByDate(uid: UID, date: string) {
    return pipe(
      this.scheduledTaskRepo.findUserTasksByDate(uid, date),
      TE.map(this.temporary_extractTasks)
    )
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

  findTodayTasks(
    uid: UID
  ): TE.TaskEither<UserError, Array<DefaultFetchedTaskGraph>> {
    const today = format(new Date(), DEFAULT_DATE_FORMAT)
    return pipe(
      this.scheduledTaskRepo.findUserTasksByDate(uid, today),
      TE.map(this.temporary_extractTasks)
    )
  }

  private getWeekRange(date: Date) {
    const weekConfig = {weekStartsOn: 1} as const

    return [
      format(startOfWeek(date, weekConfig), DEFAULT_DATE_FORMAT),
      format(endOfWeek(date, weekConfig), DEFAULT_DATE_FORMAT)
    ]
  }

  findWeekTasks(
    uid: UID
  ): TE.TaskEither<UserError, Array<DefaultFetchedTaskGraph>> {
    const [start, end] = this.getWeekRange(new Date())

    return pipe(
      this.scheduledTaskRepo.findWeekTasks(uid, start, end),
      TE.map(this.temporary_extractTasks)
    )
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
