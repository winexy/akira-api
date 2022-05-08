import {
  Body,
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
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {
  SharedTaskPatchDto,
  patchSharedTaskSchema,
  createSharedTaskSchema,
  CreateSharedTaskDto
} from './shared-task.model'

@UseGuards(AuthGuard)
@Controller('share-task')
export class ShareTaskController {
  constructor(private readonly shareTaskService: ShareTaskService) {}

  @Post()
  ShareTask(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createSharedTaskSchema)) dto: CreateSharedTaskDto
  ) {
    return doTask(this.shareTaskService.Create(uid, dto))
  }

  @Patch(':id')
  Update(
    @User('uid') uid: UID,
    @Param('id', ParseIntPipe) id: number,
    @Body(FujiPipe.of(patchSharedTaskSchema)) patch: SharedTaskPatchDto
  ) {
    return doTask(this.shareTaskService.Update(uid, id, patch))
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
    return doTask(this.shareTaskService.FindOneById(uid, id))
  }
}
