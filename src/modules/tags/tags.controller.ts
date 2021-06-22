import {Body, Controller, HttpCode, Post} from '@nestjs/common'
import {User} from 'src/decorators/user.decorator'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {createTagSchema, CreateTagDto} from './tag.model'
import {TagsService} from './tags.service'

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(201)
  createTag(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTagSchema)) dto: CreateTagDto
  ) {
    return this.tagsService.createTag(uid, dto)
  }
}