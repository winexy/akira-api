import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import {AuthGuard} from 'src/auth.guard'
import {User} from 'src/decorators/user.decorator'
import {ShareTaskService} from '../share-task/share-task.service'
import {doTask} from 'src/shared/do-task'

@UseGuards(AuthGuard)
@Controller('/share-task')
export class ShareTaskController {
  constructor(private readonly shareTaskService: ShareTaskService) {}

  @Post()
  ShareTask(@User('uid') uid: UID, @Param('id', ParseIntPipe) id: number) {
    // TODO
  }

  @Patch(':id')
  PatchAccessEntry(
    @User('uid') uid: UID,
    @Param('id', ParseIntPipe) id: number
  ) {
    // TODO
  }

  @Delete(':id')
  RevokeAccess(
    @User('uid') uid: UID,
    @Param('id', ParseIntPipe) id: number
  ): Promise<boolean> {
    return doTask(this.shareTaskService.RevokeAccess(uid, id))
  }

  @Get(':id')
  FindAccessEntry(
    @User('uid') uid: UID,
    @Param('id', ParseIntPipe) id: number
  ) {
    // TODO
  }
}
