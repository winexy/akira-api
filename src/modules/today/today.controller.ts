import {Controller, Post, Param, Delete, UseGuards} from '@nestjs/common'
import {TodayService} from './today.service'
import {AuthGuard} from '../../auth.guard'
import {User} from '../../decorators/user.decorator'
import {TaskIdT} from '../tasks/task.model'

@Controller('today')
@UseGuards(AuthGuard)
export class TodayController {
  constructor(private readonly todayService: TodayService) {}

  @Post(':taskId')
  async create(@User('uid') uid: UID, @Param('taskId') taskId: TaskIdT) {
    const result = await this.todayService.create(uid, taskId)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Delete(':taskId')
  async remove(@User('uid') uid: UID, @Param('taskId') taskId: TaskIdT) {
    const result = await this.todayService.remove(uid, taskId)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }
}
