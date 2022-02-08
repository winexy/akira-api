import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common'
import {User} from 'src/decorators/user.decorator'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {createTagSchema, CreateTagDto, Tag} from './tag.model'
import {TagsService} from './tags.service'
import {AuthGuard} from '../../auth.guard'
import {doTask} from 'src/shared/do-task'

@UseGuards(AuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  FindAll(@User('uid') uid: UID) {
    return this.tagsService.FindAll(uid)
  }

  @Post()
  @HttpCode(201)
  CreateTag(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTagSchema)) dto: CreateTagDto
  ) {
    return doTask(this.tagsService.CreateTag(uid, dto))
  }

  @Delete(':tagId')
  DeleteTag(
    @User('uid') uid: UID,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    return doTask(this.tagsService.DeleteTag(uid, tagId))
  }
}
