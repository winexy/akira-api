import {Injectable} from '@nestjs/common'
import {ScheduledTaskRepo} from './scheduled-task.repo'
import {ScheduleTaskDto} from './scheduled-task.model'
import {TasksService} from '../tasks/tasks.service'

@Injectable()
export class TaskSchedulerService {
  constructor(
    private readonly taskService: TasksService,
    private readonly scheduledTaskRepo: ScheduledTaskRepo
  ) {}

  async create(uid: UID, dto: ScheduleTaskDto) {
    const isAuthor = await this.taskService.ensureAuthority(dto.task_id, uid)

    return isAuthor.asyncMap(() => this.scheduledTaskRepo.create(dto))
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
