import {Controller, Post, Param, Delete, UseGuards, Get} from '@nestjs/common'
import {MyDayService} from './myday.service'
import {AuthGuard} from '../../auth.guard'
import {User} from '../../decorators/user.decorator'
import {TaskIdT} from '../tasks/task.model'

@Controller('myday')
@UseGuards(AuthGuard)
export class MyDayController {
  constructor(private readonly myDayService: MyDayService) {}

  @Get()
  async findAll(@User('uid') uid: UID) {
    const result = await this.myDayService.findAll(uid)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Post(':taskId')
  async create(@User('uid') uid: UID, @Param('taskId') taskId: TaskIdT) {
    const result = await this.myDayService.create(uid, taskId)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Delete(':taskId')
  async remove(@User('uid') uid: UID, @Param('taskId') taskId: TaskIdT) {
    const result = await this.myDayService.remove(uid, taskId)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }
}
