import {Injectable} from '@nestjs/common'
import {TasksService} from '../tasks/tasks.service'

@Injectable()
export class ReportsService {
  constructor(private readonly tasksService: TasksService) {}

  async findFor(uid: UID, date: string) {
    const tasks = await this.tasksService.findByUpdatedAtDate(uid, date)
    return {date, tasks}
  }
}
